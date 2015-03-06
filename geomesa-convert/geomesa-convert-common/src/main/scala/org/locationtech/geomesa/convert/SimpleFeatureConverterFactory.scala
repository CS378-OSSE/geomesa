/*
 * Copyright 2014 Commonwealth Computer Research, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.locationtech.geomesa.convert

import javax.imageio.spi.ServiceRegistry

import com.typesafe.config.Config
import com.typesafe.scalalogging.slf4j.Logging
import org.locationtech.geomesa.convert.Transformers.{EvaluationContext, Expr}
import org.locationtech.geomesa.feature.AvroSimpleFeatureFactory
import org.opengis.feature.simple.{SimpleFeature, SimpleFeatureType}

import scala.collection.JavaConversions._
import scala.util.{Failure, Success, Try}

trait Field {
  def name: String
  def transform: Transformers.Expr
  def eval(args: Any*)(implicit ec: EvaluationContext): Any = transform.eval(args: _*)
}

case class SimpleField(name: String, transform: Transformers.Expr) extends Field

trait SimpleFeatureConverterFactory[I] {

  def canProcess(conf: Config): Boolean

  def canProcessType(conf: Config, name: String) = Try { conf.getString("type").equals(name) }.getOrElse(false)

  def buildConverter(sft: SimpleFeatureType, conf: Config): SimpleFeatureConverter[I]

  def buildFields(fields: Seq[Config]): IndexedSeq[Field] =
    fields.map { f =>
      val name = f.getString("name")
      val transform = Transformers.parseTransform(f.getString("transform"))
      SimpleField(name, transform)
    }.toIndexedSeq

  def buildIdBuilder(t: String) = Transformers.parseTransform(t)

}

object SimpleFeatureConverters {
  val providers = ServiceRegistry.lookupProviders(classOf[SimpleFeatureConverterFactory[_]]).toList

  def build[I](sft: SimpleFeatureType, conf: Config) = {
    val converterConfig = conf.getConfig("converter")
    providers
      .find(_.canProcess(converterConfig))
      .map(_.buildConverter(sft, converterConfig).asInstanceOf[SimpleFeatureConverter[I]])
      .getOrElse(throw new IllegalArgumentException(s"Cannot find factory for ${sft.getTypeName}"))
  }
}

trait SimpleFeatureConverter[I] {
  def targetSFT: SimpleFeatureType
  def processInput(is: Iterator[I]): Iterator[SimpleFeature]
  def processSingleInput(i: I): Option[SimpleFeature]
  def close(): Unit = {}
}

trait ToSimpleFeatureConverter[I] extends SimpleFeatureConverter[I] with Logging {
  def logErrors: Boolean = false
  def targetSFT: SimpleFeatureType
  def inputFields: IndexedSeq[Field]
  def idBuilder: Expr
  def fromInputType(i: I): Array[Any]
  val fieldNameMap = inputFields.zipWithIndex.map { case (f, idx) => (f.name, idx)}.toMap
  val featureFactory = new AvroSimpleFeatureFactory
  val nfields = inputFields.length

  val indexes =
    targetSFT.getAttributeDescriptors.flatMap { attr =>
      val targetIdx = targetSFT.indexOf(attr.getName)
      val attrName  = attr.getLocalName
      val inputIdx  = inputFields.indexWhere { f => f.name.equals(attrName) }

      if(inputIdx == -1) None
      else               Some((targetIdx, inputIdx))

    }.toIndexedSeq

  val nattributes = indexes.length

  implicit val ctx = new EvaluationContext(fieldNameMap, null)

  def convert(t: Array[Any], reuse: Array[Any], sfAttrReuse: Array[Any]): SimpleFeature = {
    import spire.syntax.cfor._

    val attributes =
      if(reuse == null) Array.ofDim[Any](inputFields.length)
      else reuse
    ctx.computedFields = attributes

    cfor(0)(_ < nfields, _ + 1) { i =>
      attributes(i) = inputFields(i).eval(t: _*)
    }

    val sfAttributes =
      if(sfAttrReuse == null) Array.ofDim[Any](targetSFT.getAttributeCount)
      else sfAttrReuse

    cfor(0)(_ < nattributes, _ + 1) { i =>
      val (targetIdx, inputIdx) = indexes(i)
      sfAttributes(targetIdx) = attributes(inputIdx)
    }

    val id = idBuilder.eval(t: _*).asInstanceOf[String]
    featureFactory.createSimpleFeature(sfAttributes.asInstanceOf[Array[AnyRef]], targetSFT, id)
  }

  val reuse = Array.ofDim[Any](inputFields.length)
  val sfAttrReuse = Array.ofDim[Any](targetSFT.getAttributeCount)

  def processSingleInput(i: I): Option[SimpleFeature] =
    Try { convert(fromInputType(i), reuse, sfAttrReuse) } match {
      case Success(s) => Some(s)
      case Failure(t) =>
        logger.debug("Failed to parse input", t)
        None
    }

  def processInput(is: Iterator[I]): Iterator[SimpleFeature] =
    is.flatMap { s => processSingleInput(s) }


}
