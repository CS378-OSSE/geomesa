package geomesa.core.util

import geomesa.core.data.AccumuloConnectorCreator
import org.apache.accumulo.core.client.{BatchScanner, Scanner}
import org.opengis.feature.simple.SimpleFeatureType


class ExplainingConnectorCreator(output: String => Unit = println) extends AccumuloConnectorCreator {
  /**
   * Create a BatchScanner for the SpatioTemporal Index Table
   *
   * @param numThreads number of threads for the BatchScanner
   */
  override def createSpatioTemporalIdxScanner(sft: SimpleFeatureType, numThreads: Int): BatchScanner = new ExplainingBatchScanner(output)

  /**
   * Create a BatchScanner for the SpatioTemporal Index Table
   */
  override def createSTIdxScanner(sft: SimpleFeatureType): BatchScanner = new ExplainingBatchScanner(output)

  /**
   * Create a Scanner for the Attribute Table (Inverted Index Table)
   */
  override def createAttrIdxScanner(sft: SimpleFeatureType): Scanner = new ExplainingScanner(output)

  /**
   * Create a BatchScanner to retrieve only Records (SimpleFeatures)
   */
  override def createRecordScanner(sft: SimpleFeatureType, numThreads: Int): BatchScanner = new ExplainingBatchScanner(output)

  override def catalogTableFormat(sft: SimpleFeatureType): Boolean = true
}