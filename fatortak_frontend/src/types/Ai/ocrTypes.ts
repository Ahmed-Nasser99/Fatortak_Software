export interface OcrInvoiceCreateDto {
  customerId?: string;
  sallerName?: string;
  sallerEmail?: string;
  sallerPhone?: string;
  sallerAddress?: string;
  sallerTaxNumber?: string;
  sallerVATNumber?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerTaxNumber?: string;
  buyerVATNumber?: string;
  issueDate: string;
  dueDate: string;
  invoiceType?: string;
  status?: string;
  notes?: string;
  terms?: string;
  purchaseType?: string;
  items: OcrInvoiceItemCreateDto[];
  downPayment?: number;
  numberOfInstallments?: number;
  benefits?: number;
  installments?: InstallmentCreateDto[];
}

export interface OcrInvoiceItemCreateDto {
  itemId?: string;
  name?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  vatRate?: number;
  discount: number;
}

export interface InstallmentCreateDto {
  dueDate: string;
  amount: number;
}
