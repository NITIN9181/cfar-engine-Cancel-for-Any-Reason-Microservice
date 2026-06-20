// Currency utilities supporting APAC currencies (INR, SGD, AUD, MYR, IDR, JPY, KRW, THB, PHP)

export function formatCurrency(amount: number, currency: string): string {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'code'
    });

    return formatter.format(amount).replace(/\u00a0/g, ' ');
  } catch (e) {
    // Fallback if Intl format fails
    const decimals = (currency === 'JPY' || currency === 'KRW') ? 0 : 2;
    return `${currency} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }
}
