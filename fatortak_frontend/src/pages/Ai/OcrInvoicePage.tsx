"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  Image,
  File,
  Scan,
  Save,
  X,
  RotateCcw,
  Download,
  Eye,
  Loader2,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGetOcrInvoiceData, useCreateOcrInvoice } from "@/hooks/Ai/useOcr";
import {
  OcrInvoiceCreateDto,
  OcrInvoiceItemCreateDto,
} from "@/types/Ai/ocrTypes";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { parseLocalDate } from "@/Helpers/parseDateTimeToDateOnly";

const OcrInvoicePage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const getOcrDataMutation = useGetOcrInvoiceData();
  const createOcrInvoiceMutation = useCreateOcrInvoice();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [extractedData, setExtractedData] =
    useState<OcrInvoiceCreateDto | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (
      !file.type.match(
        /(image\/.*|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document)/
      )
    ) {
      toast.error(t("unsupportedFileType"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("fileTooLarge"));
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    // Reset extracted data when new file is selected
    setExtractedData(null);
    setIsProcessing(false);
  };

  // Process file with OCR
  const processFileWithOcr = async () => {
    if (!selectedFile) {
      toast.error(t("pleaseSelectFile"));
      return;
    }

    setIsProcessing(true);
    try {
      const result = await getOcrDataMutation.mutateAsync(selectedFile);

      if (result.success && result.data) {
        if (result.data.issueDate) {
          result.data.issueDate = parseLocalDate(result.data.issueDate);
        }
        if (result.data.dueDate) {
          result.data.dueDate = parseLocalDate(result.data.dueDate);
        }
        setExtractedData(result.data);
        toast.success(t("ocrProcessingComplete"));
      } else {
        toast.error(result.errorMessage || t("ocrProcessingFailed"));
      }
    } catch (error) {
      toast.error(t("ocrProcessingError"));
    } finally {
      setIsProcessing(false);
    }
  };

  // Update extracted data field
  const updateField = (field: string, value: any) => {
    setExtractedData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // Update item field
  const updateItemField = (index: number, field: string, value: any) => {
    setExtractedData((prev) => {
      if (!prev) return null;
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // Add new item
  const addNewItem = () => {
    setExtractedData((prev) => {
      if (!prev) return null;
      const newItem: OcrInvoiceItemCreateDto = {
        name: t("newItem"),
        description: "",
        quantity: 1,
        unitPrice: 0,
        vatRate: 0.14,
        discount: 0,
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    setExtractedData((prev) => {
      if (!prev) return null;
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems };
    });
  };

  // Calculate item total
  const calculateItemTotal = (item: OcrInvoiceItemCreateDto) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = afterDiscount * (item.vatRate || 0);
    return afterDiscount + vatAmount;
  };

  // Calculate invoice totals
  const calculateTotals = () => {
    if (!extractedData) return { subtotal: 0, vatTotal: 0, total: 0 };

    const subtotal = extractedData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const vatTotal = extractedData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discountAmount = itemSubtotal * (item.discount / 100);
      const afterDiscount = itemSubtotal - discountAmount;
      return sum + afterDiscount * (item.vatRate || 0);
    }, 0);

    const total = subtotal + vatTotal;

    return { subtotal, vatTotal, total };
  };

  // Save invoice
  const handleSaveInvoice = async () => {
    if (!extractedData) return;

    // Validate required fields
    if (!extractedData.issueDate) {
      toast.error(t("issueDateRequired"));
      return;
    }

    if (!extractedData.dueDate) {
      toast.error(t("dueDateRequired"));
      return;
    }

    if (extractedData.items.length === 0) {
      toast.error(t("atLeastOneItemRequired"));
      return;
    }

    try {
      const result = await createOcrInvoiceMutation.mutateAsync(extractedData);

      if (result.success) {
        toast.success(t("invoiceCreatedSuccessfully"));
        // Reset form
        setSelectedFile(null);
        setPreviewUrl("");
        setExtractedData(null);
      } else {
        toast.error(result.errorMessage || t("failedToCreateInvoice"));
      }
    } catch (error) {
      toast.error(t("invoiceCreationError"));
    }
  };

  // Reset everything
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setExtractedData(null);
    setIsProcessing(false);
  };

  const { subtotal, vatTotal, total } = calculateTotals();
  const statusOptions = [
    { value: "Draft", label: t("draftStatus") || "Draft" },
    { value: "Pending", label: t("pendingStatus") || "Pending" },
    { value: "Paid", label: t("paidStatus") || "Paid" },
  ];
  const invoiceTypeOptions = [
    { value: "Buy", label: t("buyInvoice") || "Buy Invoice" },
    { value: "Sell", label: t("sellInvoice") || "Sell Invoice" },
  ];
  const invoicePurchaseOptions = [
    { value: "merchandise", label: t("merchandise") || "Merchandise" },
    { value: "expenses", label: t("expenses") || "Expenses" },
  ];
  console.log(extractedData?.items);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className={`flex items-center justify-between relative z-10 `}>
            <div className={`flex items-center space-x-4`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-3">
                <Scan className="w-8 h-8 text-white" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h1 className="text-4xl font-bold mb-2">
                  {t("ocrInvoiceProcessing")}
                </h1>
                <p className="text-blue-100 text-lg">
                  {t("uploadAndReviewInvoice")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Panel - File Upload & Preview */}
          <div className="xl:w-1/2 space-y-6">
            {/* Upload Card */}
            <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <div
                  className={`flex items-center justify-between ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <CardTitle
                    className={`flex items-center gap-3 text-xl font-bold ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Upload className="w-6 h-6 text-blue-600" />
                    {t("uploadDocument")}
                  </CardTitle>
                  {selectedFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t("reset")}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t("dragDropFile")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                      {t("supportedFormats")}
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileSelect(e.target.files[0])
                      }
                    />
                    <Button size="lg">
                      <FileText className="w-5 h-5 mr-3" />
                      {t("chooseFile")}
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileSelect(e.target.files[0])
                        }
                      />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* File Info */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                      <div
                        className={`flex items-center justify-between ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`flex items-center space-x-4 ${
                            isRTL ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            {selectedFile.type.startsWith("image/") ? (
                              <Image className="w-6 h-6 text-green-600" />
                            ) : (
                              <File className="w-6 h-6 text-green-600" />
                            )}
                          </div>
                          <div className={isRTL ? "text-right" : "text-left"}>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Process Button */}
                    {!extractedData && (
                      <Button
                        onClick={processFileWithOcr}
                        disabled={isProcessing}
                        size="lg"
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none py-4"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        ) : (
                          <Scan className="w-6 h-6 mr-3" />
                        )}
                        <span className="text-lg font-semibold">
                          {isProcessing ? t("processing") : t("processWithOcr")}
                        </span>
                      </Button>
                    )}

                    {/* Preview */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner">
                      <div className="p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                          <Eye className="w-5 h-5 mr-2 text-gray-600" />
                          {t("documentPreview") || "Document Preview"}
                        </h4>
                      </div>
                      <div className="p-6 min-h-[300px] flex items-center justify-center">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Document preview"
                            className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg"
                          />
                        ) : selectedFile ? (
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <FileText className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                              {selectedFile.type === "application/pdf"
                                ? t("pdfDocumentPreview")
                                : t("documentPreview")}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <Eye className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                              {t("filePreviewWillAppearHere")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Extracted Data */}
          <div className="xl:w-1/2 space-y-6">
            {/* Status Header */}
            <div
              className={`flex items-center justify-between ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("extractedData")}
              </h2>
              {extractedData && (
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600 px-4 py-2"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {t("processed")}
                </Badge>
              )}
            </div>

            {!extractedData ? (
              <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 opacity-60">
                    <Scan className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("readyToProcess")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {t("uploadAndProcessFile")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                {/* Seller Information */}
                <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                      {t("sellerInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <EditableField
                        label={t("sellerName")}
                        value={extractedData.sallerName || ""}
                        onChange={(value) => updateField("sallerName", value)}
                      />
                      <EditableField
                        label={t("email")}
                        value={extractedData.sallerEmail || ""}
                        onChange={(value) => updateField("sallerEmail", value)}
                        type="email"
                      />
                      <EditableField
                        label={t("phone")}
                        value={extractedData.sallerPhone || ""}
                        onChange={(value) => updateField("sallerPhone", value)}
                      />
                      <EditableField
                        label={t("taxNumber")}
                        value={extractedData.sallerTaxNumber || ""}
                        onChange={(value) =>
                          updateField("sallerTaxNumber", value)
                        }
                      />
                    </div>
                    <EditableField
                      label={t("address")}
                      value={extractedData.sallerAddress || ""}
                      onChange={(value) => updateField("sallerAddress", value)}
                      multiline
                    />
                  </CardContent>
                </Card>

                {/* Buyer Information */}
                <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-lg">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                      {t("buyerInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <EditableField
                        label={t("buyerName")}
                        value={extractedData.buyerName || ""}
                        onChange={(value) => updateField("buyerName", value)}
                      />
                      <EditableField
                        label={t("email")}
                        value={extractedData.buyerEmail || ""}
                        onChange={(value) => updateField("buyerEmail", value)}
                        type="email"
                      />
                      <EditableField
                        label={t("phone")}
                        value={extractedData.buyerPhone || ""}
                        onChange={(value) => updateField("buyerPhone", value)}
                      />
                    </div>
                    <EditableField
                      label={t("address")}
                      value={extractedData.buyerAddress || ""}
                      onChange={(value) => updateField("buyerAddress", value)}
                      multiline
                    />
                  </CardContent>
                </Card>

                {/* Invoice Details */}
                <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-t-lg">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                      {t("invoiceDetails")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <EditableField
                        label={t("issueDate")}
                        value={extractedData.issueDate}
                        onChange={(value) => updateField("issueDate", value)}
                        type="date"
                      />
                      <EditableField
                        label={t("dueDate")}
                        value={extractedData.dueDate}
                        onChange={(value) => updateField("dueDate", value)}
                        type="date"
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t("invoiceType") || "Invoice Type"}
                        </label>
                        <select
                          value={extractedData?.invoiceType}
                          onChange={(e) =>
                            updateField("invoiceType", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                        >
                          {invoiceTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t("status") || "Status"}
                        </label>
                        <select
                          value={extractedData?.status}
                          onChange={(e) =>
                            updateField("status", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t("purchaseType") || "Purchase Type"}
                        </label>
                        <select
                          value={extractedData?.purchaseType}
                          onChange={(e) =>
                            updateField("purchaseType", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                        >
                          {invoicePurchaseOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Items */}
                <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-t-lg">
                    <div
                      className={`flex items-center justify-between ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        {t("items")} ({extractedData.items.length})
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addNewItem}
                        className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t("addItem")}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {extractedData.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm"
                      >
                        <div
                          className={`flex items-center justify-between mb-4 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Badge variant="outline" className="font-semibold">
                            {t("item")} {index + 1}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          <EditableField
                            label={t("name")}
                            value={item.name || ""}
                            onChange={(value) =>
                              updateItemField(index, "name", value)
                            }
                          />
                          <EditableField
                            label={t("description")}
                            value={item.description || ""}
                            onChange={(value) =>
                              updateItemField(index, "description", value)
                            }
                          />
                          <EditableField
                            label={t("quantity")}
                            value={item.quantity.toString()}
                            onChange={(value) =>
                              updateItemField(
                                index,
                                "quantity",
                                parseFloat(value) || 0
                              )
                            }
                            type="number"
                          />
                          <EditableField
                            label={t("unitPrice")}
                            value={item.unitPrice.toString()}
                            onChange={(value) =>
                              updateItemField(
                                index,
                                "unitPrice",
                                parseFloat(value) || 0
                              )
                            }
                            type="number"
                          />
                          <EditableField
                            label={`${t("vatRate")} (%)`}
                            value={
                              item.vatRate > 1
                                ? ((item.vatRate || 0) / 100).toString()
                                : ((item.vatRate || 0) * 100).toString()
                            }
                            onChange={(value) =>
                              updateItemField(
                                index,
                                "vatRate",
                                (parseFloat(value) || 0) / 100
                              )
                            }
                            type="number"
                          />
                          <EditableField
                            label={`${t("discount")} (%)`}
                            value={item.discount.toString()}
                            onChange={(value) =>
                              updateItemField(
                                index,
                                "discount",
                                parseFloat(value) || 0
                              )
                            }
                            type="number"
                          />
                        </div>

                        <div
                          className={`pt-4 border-t border-gray-200 dark:border-gray-600 ${
                            isRTL ? "text-left" : "text-right"
                          }`}
                        >
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {t("total")}: ${calculateItemTotal(item).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">
                      {t("invoiceSummary")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div
                        className={`flex justify-between items-center ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="text-blue-100 text-lg">
                          {t("subtotal")}:
                        </span>
                        <span className="font-bold text-xl">
                          {subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div
                        className={`flex justify-between items-center ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="text-blue-100 text-lg">
                          {t("vat")}:
                        </span>
                        <span className="font-bold text-xl">
                          {vatTotal.toFixed(2)}
                        </span>
                      </div>
                      <Separator className="bg-white/20" />
                      <div
                        className={`flex justify-between items-center text-2xl font-bold ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span>{t("total")}:</span>
                        <span>{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <Button
                  onClick={handleSaveInvoice}
                  disabled={createOcrInvoiceMutation.isPending}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none py-4"
                >
                  {createOcrInvoiceMutation.isPending ? (
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  ) : (
                    <Save className="w-6 h-6 mr-3" />
                  )}
                  <span className="text-lg font-semibold">
                    {createOcrInvoiceMutation.isPending
                      ? t("saving")
                      : t("createInvoice")}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Editable Field Component
interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "email" | "date";
  multiline?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </Label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm transition-all duration-200"
          rows={3}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
        />
      )}
    </div>
  );
};

export default OcrInvoicePage;
