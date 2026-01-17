declare module "sepa-payment-qr-code" {
  interface SepaQrCodeOptions {
    name: string;
    iban: string;
    bic?: string;
    amount?: number;
    currency?: string;
    remittanceInfo?: string;
    unstructuredReference?: string;
    information?: string;
  }

  export default function generateSepaQrCode(options: SepaQrCodeOptions): string;
}
