import type { LineItem } from "@/types";

type Props = {
	company?: {
		name?: string;
		address?: string;
		phone?: string;
		email?: string;
		logoUrl?: string;
	};
	client: { name?: string; address?: string };
	meta: { number?: string; date: string; dueDate?: string };
	items: LineItem[];
	totals: { subtotal: number; discount: number; vat: number; total: number };
	bank: { id: string; bank: string; account: string; name: string };
	isDiskon?: boolean;
	isPPN?: boolean;
	discount?: number;
	vat?: number;
};

export default function InvoiceTemplate({
	company,
	client,
	meta,
	items,
	totals,
	bank,
	isDiskon = false,
	isPPN = false,
	discount = 0,
	vat = 0,
}: Props) {
	return (
		<div
			className="bg-white text-gray-900 p-4 pe-4 font-sans w-full"
			style={{ maxWidth: 560 }}
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-6 mb-3">
				<div className="flex items-center gap-4">
					{company?.logoUrl && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={company.logoUrl}
							alt="logo"
							className="h-14 w-14 object-contain"
						/>
					)}
					<div>
						<div className="text-lg font-normal mb-2">
							{company?.name ?? "Nama Perusahaan"}
						</div>
						{company?.address && (
							<div className="text-[12px] mb-1">
								{company.address}
							</div>
						)}
						{(company?.phone || company?.email) && (
							<div className="text-[12px] ">
								{company?.phone && "Telp. " + company?.phone}{" "}
								{company?.email ? `• ${company.email}` : ""}
							</div>
						)}
					</div>
				</div>
				<div className="text-right">
					<div className="text-3xl mb-6 me-3 font-bold text-[#7b8dc5]">
						INVOICE
					</div>
					<table className="border text-[11px]">
						<thead className="bg-[#d3d9eb]">
							<tr>
								<th className="px-6 border text-center">
									INVOICE
								</th>
								<th className="px-6 border text-center">
									TANGGAL
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="px-4 border text-center">
									12345
								</td>
								<td className="px-4 border text-center">
									{meta.date}
								</td>
							</tr>
						</tbody>
					</table>
					{meta.number && (
						<div className="text-[12px] text-gray-600">
							No: {meta.number}
						</div>
					)}
				</div>
			</div>

			{/* Client Info */}
			<table className=" w-64 mb-4 text-[11px]">
				<thead className="bg-[#d3d9eb]">
					<tr>
						<th className="border text-start ps-2">BILL TO</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className="ps-2">
							{client?.name ? client?.name : "-"}
						</td>
					</tr>
				</tbody>
			</table>

			{/* Items Table */}
			<table
				className="w-full border border-gray-300 mb-8"
				style={{ borderCollapse: "collapse" }}
			>
				<thead>
					<tr className="bg-[#a7b3d8] text-[11px]">
						<th className="border w-min py-2 text-center font-semibold">
							NO
						</th>
						<th className="border px-3 py-2 text-center font-semibold">
							URAIAN
						</th>
						<th className="border py-2 w-min text-center font-semibold">
							QTY
						</th>
						<th className="border px-2 py-2 text-center font-semibold">
							HARGA
						</th>
						<th className="border px-2 py-2 text-center font-semibold">
							JUMLAH
						</th>
					</tr>
				</thead>
				<tbody>
					{items.map((it, i) => (
						<tr key={it.id} className="text-[11px]">
							<td className="border text-center py-[1px]">
								{i + 1}
							</td>
							<td className="border text-left ps-2 w-56">
								{it.name || "-"}
							</td>
							<td className="border  w-min text-center">
								{it.quantity}
							</td>
							<td className="border pe-1  text-right">
								{it.unitPrice.toLocaleString("id-ID")} ,-
							</td>
							<td className="border pe-1  text-right">
								{(it.quantity * it.unitPrice).toLocaleString(
									"id-ID"
								)}{" "}
								,-
							</td>
						</tr>
					))}
					<tr className="border">
						<td
							className="border text-right font-bold text-lg py-2 pe-2"
							colSpan={4}
						>
							TOTAL
						</td>
						<td className="border text-right font-bold text-lg pe-1">
							{totals.subtotal.toLocaleString("id-ID")} ,-
						</td>
					</tr>
					{isDiskon && (
						<tr className="border">
							<td
								className="border text-right font-bold text-lg py-2 pe-2"
								colSpan={4}
							>
								DISKON {discount} %
							</td>
							<td className="border text-right font-bold text-lg pe-1">
								{totals.discount.toLocaleString("id-ID")} ,-
							</td>
						</tr>
					)}
					{isPPN && (
						<tr className="border">
							<td
								className="border text-right font-bold text-lg py-2 pe-2"
								colSpan={4}
							>
								PPN {vat} %
							</td>
							<td className="border text-right font-bold text-lg pe-1">
								{totals.vat.toLocaleString("id-ID")} ,-
							</td>
						</tr>
					)}
					{isDiskon || isPPN ? (
						<tr className="border">
							<td
								className="border text-right font-bold text-lg py-2 pe-2"
								colSpan={4}
							>
								GRAND TOTAL
							</td>
							<td className="border text-right font-bold text-lg pe-1">
								{totals.total.toLocaleString("id-ID")} ,-
							</td>
						</tr>
					) : null}
				</tbody>
			</table>

			{/* Pembayaran Section */}
			<div className="mb-8 text-[11px]">
				<p>
					Pembayaran via Transfer Bank{" "}
					<span className="font-bold">
						{bank.bank} {bank.account} A.N : {bank.name}
					</span>
				</p>
			</div>

			{/* Signature */}
			<div className="flex justify-end text-[11px]">
				<div className="text-center text-black">
					<div>Hormat Kami,</div>
					<p className="font-bold">SEHAN JAYA TEKNIK</p>
					<img className="w-56" src="/img/ttd-digital.png" />
					<p className="font-bold">SAFEI</p>
				</div>
			</div>
		</div>
	);
}
