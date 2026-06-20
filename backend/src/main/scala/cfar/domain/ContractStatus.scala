package cfar.domain

enum ContractStatus(val name: String):
  case ACTIVE extends ContractStatus("active")
  case CANCELLED extends ContractStatus("cancelled")
  case REFUND_INITIATED extends ContractStatus("refund_initiated")
  case REFUNDED extends ContractStatus("refunded")
  case EXPIRED extends ContractStatus("expired")
  case VOIDED extends ContractStatus("voided")

object ContractStatus:
  def fromString(s: String): Option[ContractStatus] =
    ContractStatus.values.find(_.name.equalsIgnoreCase(s))
