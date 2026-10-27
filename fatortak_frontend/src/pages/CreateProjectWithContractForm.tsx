import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  ChevronLeft,
  Save,
  Rocket,
  Printer,
  Phone,
  Mail,
  User,
  Layout,
  FileText,
} from "lucide-react";
import { projectService } from "../services/projectService";
import { customerService } from "../services/customerService";
import { useCurrentCompany } from "../hooks/useCompanies";
import { ProjectStatus, CustomerDto } from "../types/api";
import { API_BASE_URL } from "../services/api";
import { toast } from "react-toastify";

const UNIT_OPTIONS = ["M2", "NO", "LM", "SET", "JOB", "KG", "TON"];
const TAX_OPTIONS = [
  { label: "No Tax (0%)", value: 0 },
  { label: "VAT 5%", value: 0.05 },
  { label: "VAT 10%", value: 0.1 },
  { label: "VAT 14%", value: 0.14 },
];

interface ProjectLineForm {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface ProjectSectionForm {
  sectionName: string;
  lines: ProjectLineForm[];
}

const CreateProjectWithContractForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClientId = searchParams.get("clientId");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);

  // Document Metadata State
  const [projectName, setProjectName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [quotationType, setQuotationType] = useState("Financial Offer");
  const [quotationDate, setQuotationDate] = useState(
    new Date().toLocaleDateString('en-CA')
  );
  const [paymentTerms, setPaymentTerms] = useState(
    "60% Down payment & 20% After delivery & 10% Upon Installation",
  );
  const [conditions, setConditions] = useState<string[]>([
    "Prices in EGP not include 14% VAT, scaffolding, any steel and civil works.",
    "Quotation Validity : One Week",
    "Price includes installation at (Cairo).",
  ]);
  const [activateImmediately, setActivateImmediately] = useState(true);

  const [sections, setSections] = useState<ProjectSectionForm[]>([
    {
      sectionName: "PROJECT SPECIFICATIONS & WORKS",
      lines: [{ description: "", quantity: 1, unit: "M2", unitPrice: 0 }],
    }
  ]);

  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [vatRate, setVatRate] = useState(0.14);
  const [includeVat, setIncludeVat] = useState(true);
  const [vatAmount, setVatAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  const { data: currentCompany } = useCurrentCompany();
  const companyLogo = currentCompany?.data?.logoUrl
    ? currentCompany.data.logoUrl.startsWith("http")
      ? currentCompany.data.logoUrl
      : `${API_BASE_URL}${currentCompany.data.logoUrl.startsWith("/") ? "" : "/"}${currentCompany.data.logoUrl}`
    : null;
  const companyName = currentCompany?.data?.name || "EPIC Glass and Aluminum";
  const companyPhone = currentCompany?.data?.phone || "---";
  const companyEmail =
    currentCompany?.data?.email || "epic.contracting.eg@gmail.com";
  const companyAddress = currentCompany?.data?.address || "(Cairo)";

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const newSubtotal = sections.flatMap((s) => s.lines).reduce(
      (acc, line) => acc + line.quantity * line.unitPrice,
      0,
    );
    setSubtotal(newSubtotal);
    const calculatedVat = includeVat ? newSubtotal * vatRate : 0;
    setVatAmount(calculatedVat);
    setTotal(newSubtotal + calculatedVat - discount);
  }, [sections, includeVat, vatRate, discount]);

  const fetchCustomers = async () => {
    try {
      const result = await customerService.getCustomers({
        pageNumber: 1,
        pageSize: 100,
      });
      if (result.success) {
        setCustomers(result.data.data.filter((c) => !c.isSupplier));
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    if (customers.length > 0 && queryClientId) {
      handleCustomerChange(queryClientId);
    }
  }, [customers, queryClientId]);

  const handleCustomerChange = (id: string) => {
    setClientId(id);
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      setClientEmail(customer.email || "");
      setClientPhone(customer.phoneNumber || "");
    }
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        sectionName: "NEW SECTION",
        lines: [{ description: "", quantity: 1, unit: "M2", unitPrice: 0 }],
      },
    ]);
  };

  const removeSection = (secIdx: number) => {
    if (sections.length === 1) return;
    setSections(sections.filter((_, i) => i !== secIdx));
  };

  const updateSectionName = (secIdx: number, value: string) => {
    const newSections = [...sections];
    newSections[secIdx].sectionName = value;
    setSections(newSections);
  };

  const addLine = (secIdx: number) => {
    const newSections = [...sections];
    newSections[secIdx].lines.push({
      description: "",
      quantity: 1,
      unit: "M2",
      unitPrice: 0,
    });
    setSections(newSections);
  };

  const removeLine = (secIdx: number, lineIdx: number) => {
    const newSections = [...sections];
    if (newSections[secIdx].lines.length === 1) return;
    newSections[secIdx].lines = newSections[secIdx].lines.filter(
      (_, i) => i !== lineIdx,
    );
    setSections(newSections);
  };

  const updateLine = (
    secIdx: number,
    lineIdx: number,
    field: keyof ProjectLineForm,
    value: any,
  ) => {
    const newSections = [...sections];
    newSections[secIdx].lines[lineIdx] = {
      ...newSections[secIdx].lines[lineIdx],
      [field]: value,
    };
    setSections(newSections);
  };

  // Notes/Remarks Handlers
  const addCondition = () => setConditions([...conditions, ""]);
  const removeCondition = (index: number) =>
    setConditions(conditions.filter((_, i) => i !== index));
  const updateCondition = (index: number, value: string) => {
    const newItems = [...conditions];
    newItems[index] = value;
    setConditions(newItems);
  };

  const handleSubmit = async (activate: boolean) => {
    if (
      !projectName ||
      !clientId ||
      sections.flatMap((s) => s.lines).some((l) => !l.description || l.quantity <= 0 || l.unitPrice <= 0)
    ) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setLoading(true);
    try {
      // Combine conditions and remarks for the backend 'notes' field
      const combinedNotes = [...conditions.map((c) => `- ${c}`)].join("\n");

      const payload = {
        projectName,
        clientId,
        paymentTerms,
        notes: combinedNotes,
        lines: sections.flatMap((s) => s.lines.map((l) => ({ ...l, sectionName: s.sectionName || undefined }))),
        activateImmediately: activate,
        discount: discount,
        createdAt: quotationDate,
        includeVat,
        vatRate,
      };

      const result = await projectService.createProjectWithContract(payload);
      if (result.success) {
        toast.success(
          activate
            ? "Project Activated & Invoice Generated!"
            : "Project Saved as Draft",
        );
        const newProjectId = (result.data as any).id;
        navigate(`/projects/${newProjectId}`);
      } else {
        toast.error(result.errorMessage || "Failed to create project");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-8 bg-white shadow-2xl border border-gray-200 min-h-[1100px] flex flex-col font-sans text-gray-800">
      {/* Top Floating Actions (Not part of the document) */}
      <div className="sticky top-0 z-50 bg-gray-50/90 backdrop-blur-md p-4 border-b flex justify-between items-center no-print">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Projects
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-md disabled:opacity-50 text-sm"
          >
            <Rocket className="w-4 h-4" />
            Activate & Invoice
          </button>
        </div>
      </div>

      {/* Document Content */}
      <div className="p-12 flex-grow">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
          {/* Logo Section */}
          <div className="flex-1">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-40 max-w-[350px] object-contain object-left"
              />
            ) : (
              <></>
            )}
          </div>

          {/* Metadata Table */}
          <div className="w-72 text-sm">
            <div className="grid grid-cols-2 gap-y-1">
              <span className="text-gray-500">Date</span>
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="font-semibold border-b border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none"
              />

              <span className="text-gray-500">Client Name</span>
              <select
                value={clientId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="font-semibold border-b border-gray-300 hover:border-indigo-500 outline-none truncate w-full"
              >
                <option value="">Select Client</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <span className="text-gray-500">Project</span>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name..."
                className="font-semibold border-b border-gray-300 hover:border-indigo-500 outline-none"
              />

              <span className="text-gray-500">email</span>
              <span className="font-semibold truncate text-[11px] py-1">
                {clientEmail || "---"}
              </span>

              <span className="text-gray-500">Cell Phone NO.</span>
              <span className="font-semibold py-1">{clientPhone || "---"}</span>

              <span className="text-gray-500 no-print">Tax inclusion</span>
              <div className="pt-1 no-print">
                <label className="relative inline-flex items-center cursor-pointer scale-75 origin-left">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Main Table */}
        <div className="border-2 border-black overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#334155] text-white">
                <th className="border border-black px-2 py-2 text-xs w-10">
                  Sr.
                </th>
                <th className="border border-black px-4 py-2 text-xs text-left">
                  Description
                </th>
                <th className="border border-black px-2 py-2 text-xs w-16">
                  Unit
                </th>
                <th className="border border-black px-2 py-2 text-xs w-16">
                  QTY
                </th>
                <th className="border border-black px-4 py-2 text-xs w-24">
                  Price
                </th>
                <th className="border border-black px-4 py-2 text-xs w-28">
                  TOTAL
                </th>
                <th className="border border-black w-8 no-print"></th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section, secIdx) => (
                <React.Fragment key={secIdx}>
                  <tr className="bg-[#cbd5e1] text-[#1e293b] font-bold text-sm group">
                    <td
                      colSpan={6}
                      className="border border-black px-4 py-1 text-center tracking-widest uppercase"
                    >
                      <input
                        value={section.sectionName}
                        onChange={(e) => updateSectionName(secIdx, e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-center font-bold text-sm uppercase placeholder-[#1e293b]"
                        placeholder="Section Name"
                      />
                    </td>
                    <td className="border border-black px-1 py-1 text-center align-middle no-print">
                      {sections.length > 1 && (
                        <button
                          onClick={() => removeSection(secIdx)}
                          className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                  {section.lines.map((line, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                      <td className="border border-black px-2 py-4 text-center font-bold align-top">
                        {idx + 1}
                      </td>
                      <td className="border border-black px-4 py-3 align-top">
                        <textarea
                          value={line.description}
                          onChange={(e) =>
                            updateLine(secIdx, idx, "description", e.target.value)
                          }
                          rows={4}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm resize-none leading-relaxed"
                          placeholder="Enter detailed description..."
                        />
                      </td>
                      <td className="border border-black px-2 py-4 text-center align-middle">
                        <select
                          value={line.unit}
                          onChange={(e) => updateLine(secIdx, idx, "unit", e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-center font-medium appearance-none cursor-pointer"
                        >
                          {UNIT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-black px-2 py-4 text-center align-middle">
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(secIdx, idx, "quantity", parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-center font-medium"
                        />
                      </td>
                      <td className="border border-black px-4 py-4 text-right align-middle font-medium">
                        <input
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) =>
                            updateLine(secIdx, idx, "unitPrice", parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-right font-medium"
                        />
                      </td>
                      <td className="border border-black px-4 py-4 text-right align-middle text-sm font-bold bg-[#f8fafc]">
                        {(line.quantity * line.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </td>
                      <td className="border border-black px-1 py-1 text-center align-middle no-print">
                        <button
                          onClick={() => removeLine(secIdx, idx)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Section Total Row */}
                  <tr className="bg-[#1e293b] text-white font-bold text-sm">
                    <td colSpan={5} className="border border-black px-4 py-1 text-right uppercase tracking-wider">
                      Section Total
                    </td>
                    <td className="border border-black px-4 py-1 text-right bg-[#0f172a]">
                      {section.lines
                        .reduce((acc, l) => acc + l.quantity * l.unitPrice, 0)
                        .toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </td>
                    <td className="border border-black no-print"></td>
                  </tr>

                  {/* Add Line Button Row for Section */}
                  <tr className="no-print">
                    <td colSpan={7} className="border border-black p-1 bg-white">
                      <button
                        onClick={() => addLine(secIdx)}
                        className="w-full py-1 text-xs text-indigo-400 hover:text-indigo-600 rounded flex items-center justify-center gap-1 transition-all font-medium"
                      >
                        <Plus className="w-3 h-3" />
                        Add Item to Section
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}

              {/* Add Section Button Row */}
              <tr className="no-print">
                <td
                  colSpan={7}
                  className="border border-black p-2 bg-[#f8fafc]"
                >
                  <button
                    onClick={addSection}
                    className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-400 hover:text-indigo-600 hover:border-indigo-400 rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Work Section
                  </button>
                </td>
              </tr>

              {/* Totals Section */}
              <tr className="border-t border-gray-200">
                <td colSpan={5} className="py-4 px-4 text-right align-middle">
                  <span className="text-sm font-bold text-gray-500 uppercase">
                    Sub Total
                  </span>
                </td>
                <td className="py-4 px-4 text-right align-middle">
                  <span className="font-bold text-lg">
                    {subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="no-print"></td>
              </tr>

              <tr>
                <td colSpan={5} className="py-2 px-4 text-right align-middle">
                  <div className="flex items-center justify-end gap-3">
                    <select
                      value={vatRate}
                      onChange={(e) => setVatRate(parseFloat(e.target.value))}
                      disabled={!includeVat}
                      className="no-print text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-500 font-medium outline-none focus:border-indigo-500 transition-all w-32 disabled:opacity-30"
                    >
                      <option value="" disabled>
                        Select Tax
                      </option>
                      {TAX_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {!includeVat && (
                      <span className="text-gray-300 italic text-[10px] no-print">
                        Tax Disabled
                      </span>
                    )}
                    <span className="text-sm font-bold text-gray-500 uppercase whitespace-nowrap">
                      Tax ({(vatRate * 100).toFixed(0)}%)
                    </span>
                  </div>
                </td>
                <td className="py-2 px-4 text-right align-middle">
                  <span
                    className={`font-bold transition-opacity ${includeVat ? "opacity-100" : "opacity-20"}`}
                  >
                    {vatAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="no-print"></td>
              </tr>

              <tr>
                <td colSpan={5} className="py-2 px-4 text-right align-middle">
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-sm font-bold text-gray-500 uppercase whitespace-nowrap">
                      Discount
                    </span>
                  </div>
                </td>
                <td className="py-2 px-4 text-right align-middle">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-[#fef2f2] border border-rose-100 rounded px-2 py-1 text-sm text-right font-bold text-rose-600 outline-none focus:border-rose-400 no-print"
                    placeholder="0.00"
                  />
                  <span className="hidden print:inline font-bold text-rose-600">
                    -
                    {discount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="no-print"></td>
              </tr>

              <tr className="bg-gray-50/50">
                <td colSpan={5} className="py-4 px-4 text-right align-middle">
                  <span className="text-base font-black uppercase tracking-wider text-gray-900">
                    Total
                  </span>
                </td>
                <td className="py-4 px-4 text-right align-middle">
                  <span className="font-black text-xl text-black">
                    {total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="no-print"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Notes Section */}
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center no-print-section">
              <h3 className="font-bold underline text-sm">
                Please note the following:
              </h3>
              <button
                onClick={addCondition}
                className="no-print text-[10px] bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Condition
              </button>
            </div>

            <div className="text-[12px] leading-relaxed space-y-3">
              {/* Payment Terms - Fixed label but editable value */}
              <div className="flex gap-2 group">
                <span className="font-bold min-w-[5px]">-</span>
                <div className="flex flex-wrap gap-1 items-center flex-grow">
                  <span className="font-bold shrink-0">Payment Terms :</span>
                  <input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="flex-grow border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none bg-transparent h-5 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Conditions */}
              {conditions.map((condition, idx) => (
                <div key={idx} className="flex gap-2 group">
                  <span className="font-bold min-w-[5px]">-</span>
                  <textarea
                    value={condition}
                    onChange={(e) => updateCondition(idx, e.target.value)}
                    rows={1}
                    className="flex-grow border-b border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none bg-transparent py-0 h-auto min-h-[1.2rem] resize-none overflow-hidden transition-all"
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = target.scrollHeight + "px";
                    }}
                  />
                  <button
                    onClick={() => removeCondition(idx)}
                    className="no-print opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Internal CSS for printing and custom font look */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .max-w-5xl { max-width: 100% !important; border: none !important; box-shadow: none !important; margin: 0 !important; }
          @page { margin: 1.5cm; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .font-cursive { font-family: 'Dancing Script', cursive; }
      `,
        }}
      />
    </div>
  );
};

export default CreateProjectWithContractForm;
