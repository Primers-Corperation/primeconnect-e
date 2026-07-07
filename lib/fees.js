// Paystack NG card/bank fee schedule: 1.5% + ₦100, flat ₦100 waived under
// ₦2,500, fee capped at ₦2,000. Reversed here so the *customer* covers
// Paystack's cut (Paystack deducts its fee from what they pay us, so we
// must charge them enough that what lands in our balance still equals
// their intended wallet credit) plus a platform margin on top.
const PAYSTACK_PCT = 0.015;
const PAYSTACK_FLAT = 100;
const PAYSTACK_FLAT_WAIVED_BELOW = 2500;
const PAYSTACK_FEE_CAP = 2000;

function paystackFee(amount) {
  const flat = amount >= PAYSTACK_FLAT_WAIVED_BELOW ? PAYSTACK_FLAT : 0;
  return Math.min(PAYSTACK_FEE_CAP, amount * PAYSTACK_PCT + flat);
}

function getPlatformMarginPct() {
  const n = Number(process.env.TOPUP_MARGIN_PCT);
  return Number.isFinite(n) && n >= 0 ? n : 0.015;
}

// Given the amount a user wants credited to their wallet, returns the
// amount they must be charged on Paystack so that, after Paystack's fee is
// deducted from our balance, the wallet credit and platform margin are
// both fully covered. Fixed-point iteration: the fee itself depends on the
// charge amount, so a few passes converge to a stable value.
export function computeTopupCharge(walletAmount) {
  const target = walletAmount * (1 + getPlatformMarginPct());
  let charge = target;
  for (let i = 0; i < 5; i++) {
    charge = target + paystackFee(charge);
  }
  return Math.ceil(charge);
}
