/*
 * Copyright 2014 Commonwealth Computer Research, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.locationtech.geomesa.core.iterators

import java.util.{Map => JMap}

import com.typesafe.scalalogging.slf4j.Logging
import org.apache.accumulo.core.data.{Key, Value}
import org.apache.accumulo.core.iterators.{Filter, IteratorEnvironment, SortedKeyValueIterator}
import org.geotools.feature.simple.SimpleFeatureBuilder
import org.geotools.filter.text.ecql.ECQL
import org.locationtech.geomesa.core._
import org.locationtech.geomesa.core.index._
import org.locationtech.geomesa.utils.geotools.SimpleFeatureTypes

class AttributeIndexFilteringIterator extends Filter with Logging with WrappedSTFilter {

  var indexEncoder: IndexValueEncoder = null

  override def init(source: SortedKeyValueIterator[Key, Value],
                    options: JMap[String, String],
                    env: IteratorEnvironment) {
    super.init(source, options, env)
    // NB: This is copied code from the STII.  Consider refactoring.
    if (options.containsKey(DEFAULT_FILTER_PROPERTY_NAME) && options.containsKey(GEOMESA_ITERATORS_SIMPLE_FEATURE_TYPE)) {
      val featureType = SimpleFeatureTypes.createType("DummyType", options.get(GEOMESA_ITERATORS_SIMPLE_FEATURE_TYPE))
      featureType.decodeUserData(options, GEOMESA_ITERATORS_SIMPLE_FEATURE_TYPE)
      dateAttributeName = getDtgFieldName(featureType)

      indexEncoder = IndexValueEncoder(featureType)

      val filterString  = options.get(DEFAULT_FILTER_PROPERTY_NAME)
      filter = ECQL.toFilter(filterString)
      logger.debug(s"In AIFI with $filter")
      val sfb = new SimpleFeatureBuilder(featureType)

      testSimpleFeature = sfb.buildFeature("test")
    }
  }

  override def deepCopy(env: IteratorEnvironment) = {
    val copy = super.deepCopy(env).asInstanceOf[AttributeIndexFilteringIterator]
    copy.filter = filter
    copy.testSimpleFeature = testSimpleFeature
    copy
  }

  override def accept(k: Key, v: Value): Boolean =
    indexEncoder == null || { // if index encoder is not set, wrapped filter will be a no-op
      val decoded = indexEncoder.decode(v.get())
      wrappedSTFilter(decoded.geom, decoded.date.map(_.getTime))
    }
}

