package cfar.domain

import java.time.Instant

object EligibilityValidator:
  def validateCancellation(
    contract: CfarContract,
    now: Instant,
    cancellationWindowH: Int
  ): Either[AppError, Unit] =
    if (contract.status != ContractStatus.ACTIVE) {
      Left(ContractNotActive(contract.status))
    } else if (now.isAfter(contract.expiresAt) || now.equals(contract.expiresAt)) {
      Left(WindowClosed(contract.departureDate, cancellationWindowH))
    } else {
      Right(())
    }
