import { useMemo, useState } from "react";
import { storage } from "@/lib/storage";
import type { BizDocument, Client, DocumentType, LineItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { formatDocxError } from "@/lib/utils";
import InvoiceTemplate from "@/templates/InvoiceTemplate";
import QuotationTemplate from "@/templates/QuotationTemplate";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

function number(v: string) {
	const n = parseFloat(v);
	return Number.isFinite(n) ? n : 0;
}

export default function BuatDokumen() {
	const clients = storage.getClients();
	const templates = storage.getItemTemplates();
	const [type, setType] = useState<DocumentType>("invoice");
	const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
	const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
	const [dueDate, setDueDate] = useState<string>("");
	const [discount, setDiscount] = useState<number>(0);
	const [vat, setVat] = useState<number>(11);
	const [items, setItems] = useState<LineItem[]>([
		{ id: crypto.randomUUID(), name: "", quantity: 1, unitPrice: 0 },
	]);
	const [isDiskon, setIsDiskon] = useState(false);
	const [isPPN, setIsPPN] = useState(false);
	const [prompt, setPrompt] = useState("");
	const [selectedTemplate, setSelectedTemplate] = useState("");
	const [invoiceNo, setInvoiceNo] = useState<number>(() =>
		storage.getAndIncrementInvoiceNo()
	);
	const banks = storage.getBanks();
	const [bankId, setBankId] = useState<string>(banks[0]?.id ?? "bri");

	const client = useMemo<Client | undefined>(
		() => clients.find((c) => c.id === clientId),
		[clients, clientId]
	);

	const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
	const discountAmt = subtotal * (discount / 100);
	const vatAmt = (subtotal - discountAmt) * (vat / 100);
	const total = Math.max(0, subtotal - discountAmt + vatAmt);

	function setItem<K extends keyof LineItem>(
		id: string,
		key: K,
		value: LineItem[K]
	) {
		setItems((prev) =>
			prev.map((it) => (it.id === id ? { ...it, [key]: value } : it))
		);
	}

	function addItem() {
		setItems((prev) => [
			...prev,
			{ id: crypto.randomUUID(), name: "", quantity: 1, unitPrice: 0 },
		]);
	}
	function removeItem(id: string) {
		setItems((prev) => prev.filter((it) => it.id !== id));
	}

	function addFromTemplate() {
		const tpl = templates.find((t) => t.id === selectedTemplate);
		if (!tpl) return;
		setItems((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				name: tpl.name,
				quantity: 1,
				unitPrice: tpl.unitPrice,
			},
		]);
	}

	function save() {
		const docs = storage.getDocuments();
		const doc: BizDocument = {
			id: crypto.randomUUID(),
			type,
			clientId,
			date,
			dueDate: dueDate || undefined,
			items,
			discount,
			vat,
			total,
		};
		storage.saveDocuments([doc, ...docs]);
		alert("Dokumen tersimpan di Riwayat");
	}

	async function exportPDF() {
		const node = document.getElementById("preview");
		if (!node) return;
		const dataUrl = await htmlToImage.toPng(node);
		const pdf = new jsPDF({ unit: "px", format: "a4" });
		const pageWidth = pdf.internal.pageSize.getWidth();
		const imgProps = (pdf as any).getImageProperties(dataUrl);
		const ratio = Math.min(pageWidth / imgProps.width, 1);
		pdf.addImage(
			dataUrl,
			"PNG",
			16,
			16,
			imgProps.width * ratio,
			imgProps.height * ratio
		);
		pdf.save(`${type}-${date}.pdf`);
	}

	async function exportDocx() {
		// Jika user ingin 100% mengikuti template DOCX asli, gunakan docxtemplater
		try {
			const templatePath =
				type === "invoice"
					? "/templates/invoice.docx"
					: "/templates/quotation.docx";
			const res = await fetch(templatePath);
			const arrayBuffer = await res.arrayBuffer();
			const zip = new PizZip(arrayBuffer);
			const doc = new Docxtemplater(zip, {
				paragraphLoop: true,
				linebreaks: true,
			});

			const mappedItems = items.map((it, idx) => ({
				no: String(idx + 1),
				description: it.name,
				quantity: it.quantity,
				unitPrice: it.unitPrice.toLocaleString("id-ID"),
				lineTotal: (it.quantity * it.unitPrice).toLocaleString("id-ID"),
			}));

			doc.setData({
				client_name: client?.name ?? "-",
				client_address: client?.address ?? "-",
				doc_number: String(invoiceNo),
				doc_date: date,
				// due_date: dueDate || '',
				// valid_until: dueDate || '',

				items: mappedItems,
				subtotal: subtotal.toLocaleString("id-ID"),
				discount: discountAmt.toLocaleString("id-ID"),
				vat: vatAmt.toLocaleString("id-ID"),
				total: total.toLocaleString("id-ID"),

				// Bank details untuk catatan pembayaran
				bank_line: (() => {
					const b = banks.find((x) => x.id === bankId);
					return b ? `${b.bank} ${b.account} A.N : ${b.name}` : "";
				})(),
			});

			doc.render();
			const out = doc.getZip().generate({ type: "blob" });
			saveAs(out, `${type}-${date}.docx`);
		} catch (err) {
			console.error(err);
			alert("Gagal membuat DOCX dari template.\n" + formatDocxError(err));
		}
	}

	function aiFill() {
		const lower = prompt.toLowerCase();
		if (lower.includes("invoice")) setType("invoice");
		if (lower.includes("penawaran")) setType("quotation");
		const matchClient = /untuk\s+([^,]+)/.exec(prompt);
		if (matchClient) {
			const name = matchClient[1].trim();
			const c = storage
				.getClients()
				.find((x) => x.name.toLowerCase() === name.toLowerCase());
			if (c) setClientId(c.id);
		}
		const qty = /([0-9]+)\s+([^,]+),/.exec(lower);
		const price = /rp\s?([0-9\.]+)/.exec(lower);
		if (qty && price) {
			setItems([
				{
					id: crypto.randomUUID(),
					name: qty[2],
					quantity: Number(qty[1]),
					unitPrice: Number(price[1].replace(/\./g, "")),
				},
			]);
		}
		const due = /jatuh tempo\s+([0-9]+)\s+hari/.exec(lower);
		if (due) {
			const d = new Date();
			d.setDate(d.getDate() + Number(due[1]));
			setDueDate(format(d, "yyyy-MM-dd"));
		}
	}

	return (
		<div className="p-6 flex gap-6 md:flex-col sm:flex-col">
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Form Dokumen</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="type">Jenis</Label>
							<Select
								value={type}
								onValueChange={(e) =>
									setType(e.valueOf() as DocumentType)
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Jenis" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="invoice">
										Invoice
									</SelectItem>
									<SelectItem value="quotation">
										Penawaran
									</SelectItem>
									<SelectItem value="bast">BAST</SelectItem>
									<SelectItem value="receipt">
										Kwitansi
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Nomor Invoice</Label>
							<Input
								value={invoiceNo}
								onChange={(e) =>
									setInvoiceNo(
										parseInt(e.target.value || "0")
									)
								}
							/>
						</div>
						<div>
							<Label>Rekening Bank</Label>
							<Select
								value={bankId}
								onValueChange={(e) => setBankId(e.valueOf())}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Bank" />
								</SelectTrigger>
								<SelectContent>
									{banks.map((b) => (
										<SelectItem key={b.id} value={b.id}>
											{b.bank} • {b.account} • A.N{" "}
											{b.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="client">Klien</Label>
							<Select
								value={clientId}
								onValueChange={(e) => setClientId(e.valueOf())}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Pilih Klien..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value=".">
										Pilih Klien...
									</SelectItem>
									{clients.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="date">Tanggal</Label>
							<Input
								id="date"
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="due">Jatuh Tempo (opsional)</Label>
							<Input
								id="due"
								type="date"
								value={dueDate}
								onChange={(e) => setDueDate(e.target.value)}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-end gap-2">
							<div className="flex-1">
								<Label>Item Uraian</Label>
								<Select
									value={selectedTemplate}
									onValueChange={(e) =>
										setSelectedTemplate(e.valueOf())
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Pilih Item Uraian..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value=".">
											Pilih Item...
										</SelectItem>
										{templates.map((t) => (
											<SelectItem key={t.id} value={t.id}>
												{t.name} —{" "}
												{t.unitPrice.toLocaleString(
													"id-ID"
												)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Button variant="outline" onClick={addFromTemplate}>
								Tambahkan
							</Button>
						</div>
						<div className="text-sm font-medium">
							Daftar Barang/Jasa
						</div>
						{items.map((it) => (
							<div
								key={it.id}
								className="grid grid-cols-12 gap-2"
							>
								<Input
									className="col-span-5"
									placeholder="Nama item"
									value={it.name}
									onChange={(e) =>
										setItem(it.id, "name", e.target.value)
									}
								/>
								<Input
									className="col-span-2"
									type="number"
									min={0}
									value={it.quantity}
									onChange={(e) =>
										setItem(
											it.id,
											"quantity",
											number(e.target.value)
										)
									}
								/>
								<Input
									className="col-span-3"
									type="number"
									min={0}
									value={it.unitPrice}
									onChange={(e) =>
										setItem(
											it.id,
											"unitPrice",
											number(e.target.value)
										)
									}
								/>
								<Button
									className="col-span-2"
									variant="secondary"
									onClick={() => removeItem(it.id)}
								>
									Hapus
								</Button>
							</div>
						))}
						<Button variant="outline" onClick={addItem}>
							Tambah Item
						</Button>
					</div>

					<div className="flex gap-4">
						<div className="flex w-min gap-4">
							<Button
								variant={isDiskon ? "default" : "secondary"}
								onClick={() => setIsDiskon(!isDiskon)}
							>
								Pakai Diskon?
              </Button>
              <Button
								variant={isPPN ? "default" : "secondary"}
								onClick={() => setIsPPN(!isPPN)}
							>
								Pakai PPN?
							</Button>
						</div>
						{isDiskon && (
							<div className="w-full">
								<Label>Diskon (%)</Label>
								<Input
									type="number"
									min={0}
									value={discount}
									onChange={(e) =>
										setDiscount(number(e.target.value))
									}
								/>
							</div>
            )}
						{isPPN && (
							<div className="w-full">
								<Label>PPN (%)</Label>
								<Input
									type="number"
									min={0}
									value={vat}
									onChange={(e) =>
										setVat(number(e.target.value))
									}
								/>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label>AI Assistant</Label>
						<Input
							placeholder="Contoh: Buat invoice untuk PT Sejahtera, 10 kursi, Rp200000 per unit, jatuh tempo 30 hari"
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
						/>
						<Button variant="outline" onClick={aiFill}>
							Isi Otomatis
						</Button>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<Button onClick={save}>Generate</Button>
						<Button
							variant="secondary"
							onClick={() => window.print()}
						>
							Preview / Print
						</Button>
						<Button variant="outline" onClick={exportPDF}>
							Ekspor PDF
						</Button>
						<Button variant="outline" onClick={exportDocx}>
							Ekspor DOCX
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card className="w-[580px]">
				<CardHeader>
					<CardTitle className="text-base">Preview</CardTitle>
				</CardHeader>
				<CardContent id="preview" className="text-sm p-0 m-0">
					{type === "invoice" ? (
						<InvoiceTemplate
							company={{
								name: "CV. SEHAN JAYA TEKNIK",
								address:
									"Jl. Sukasari 9 no.178 " +
									"\n\n" +
									"Cirebon",
								phone: "0813-3711-0005",
							}}
							client={{
								name: client?.name,
								address: client?.address,
							}}
							meta={{ number: undefined, date, dueDate }}
							items={items}
							totals={{
								subtotal,
								discount: discountAmt,
								vat: vatAmt,
								total,
							}}
              bank={banks.filter((b) => b.id === bankId)[0]}
              isDiskon={isDiskon}
              isPPN={isPPN}
              discount={discount}
              vat={vat}
						/>
					) : type === "quotation" ? (
						<QuotationTemplate
							company={{
								name: "CV. SEHAN JAYA TEKNIK",
								address:
									"Jl. Sukasari 9 no.178 " +
									"\n\n" +
									"Cirebon",
								phone: "0813-3711-0005",
							}}
							client={{
								name: client?.name,
								address: client?.address,
							}}
							meta={{
								number: undefined,
								date,
								validUntil: dueDate,
							}}
							items={items}
							totals={{
								subtotal,
								discount: discountAmt,
								vat: vatAmt,
								total,
							}}
						/>
					) : (
						<div>
							{/* fallback template sederhana untuk BAST/Kwitansi */}
							<div className="text-2xl font-semibold uppercase">
								{type}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
