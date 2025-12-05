import  { useEffect, useMemo, useState } from 'react';
import { Seat, SeatData } from '@/components/Seat.tsx';

import { Button } from '@/components/ui/button.tsx';

import './App.css';

const API_BASE = 'https://nfctron-frontend-seating-case-study-2024.vercel.app';

// ======================
// API Types
// ======================
type EventResponse = {
	eventId: string;
	namePub: string;
	description: string;
	currencyIso: string;
	dateFrom: string;
	dateTo: string;
	headerImageUrl: string;
	place: string;
};

type TicketType = {
	id: string;
	name: string;
	price: number;
};

type SeatApi = {
	seatId: string;
	place: number;
	ticketTypeId: string;
};

type SeatRowApi = {
	seatRow: number;
	seats: SeatApi[];
};

type EventTicketsResponse = {
	ticketTypes: TicketType[];
	seatRows: SeatRowApi[];
};

// ======================
// Helpers
// ======================
async function apiGet<T>(path: string): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`);
	if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
	return res.json();
}

function formatCurrency(value: number, currency: string) {
	return new Intl.NumberFormat('cs-CZ', {
		style: 'currency',
		currency
	}).format(value);
}

// ======================
// Component
// ======================

function App() {
	const isLoggedIn = false;

	// API data
	const [eventData, setEventData] = useState<EventResponse | null>(null);
	const [ticketsData, setTicketsData] = useState<EventTicketsResponse | null>(null);
	const [loading, setLoading] = useState(true);

	// Cart
	const [cart, setCart] = useState<Record<string, SeatData>>({});

	const totalTickets = Object.keys(cart).length;
	const totalAmount = Object.values(cart).reduce((sum, seat) => sum + seat.price, 0);
	const currency = eventData?.currencyIso ?? 'CZK';

	// Load event + seating
	useEffect(() => {
		async function load() {
			try {
				const event = await apiGet<EventResponse>('/event');
				setEventData(event);

				const tickets = await apiGet<EventTicketsResponse>(
					`/event-tickets?eventId=${event.eventId}`
				);
				setTicketsData(tickets);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}

		load();
	}, []);

	// Prepare seating rows with merged ticket prices
	const seatingRows = useMemo(() => {
		if (!ticketsData) return [];

		const ticketMap = new Map<string, TicketType>();
		ticketsData.ticketTypes.forEach((t) => ticketMap.set(t.id, t));

		return ticketsData.seatRows
			.sort((a, b) => a.seatRow - b.seatRow)
			.map((row) => ({
				...row,
				seats: row.seats
					.map((s): SeatData => {
						const t = ticketMap.get(s.ticketTypeId)!;
						return {
							seatId: s.seatId,
							row: row.seatRow,
							place: s.place,
							price: t.price,
							ticketTypeName: t.name
						};
					})
					.sort((a, b) => a.place - b.place)
			}));
	}, [ticketsData]);

	// Toggle seat in cart
	const toggleSeatInCart = (seat: SeatData) => {
		setCart((prev) => {
			if (prev[seat.seatId]) {
				const rest = { ...prev };
				delete rest[seat.seatId];
				return rest;
			}
			return { ...prev, [seat.seatId]: seat };
		});
	};

	return (
		<div className="flex flex-col grow min-h-screen bg-zinc-50">
			{/* header */}
			<nav className="sticky top-0 left-0 right-0 bg-white border-b border-zinc-200 flex justify-center">
				<div className="max-w-screen-lg p-4 grow flex items-center justify-between gap-3">
					<div className="max-w-[250px] w-full flex items-center gap-2">
						<div className="bg-violet-600 rounded-md size-12 flex items-center justify-center text-white font-bold text-xl">
							N
						</div>
						<div className="hidden sm:flex flex-col">
							<span className="font-semibold text-zinc-900">NFCTRON Seating Demo</span>
							<span className="text-xs text-zinc-500">Case study 2024 – React/TS</span>
						</div>
					</div>

					<div className="bg-zinc-100 rounded-md h-8 w-[200px]" />

					<div className="max-w-[250px] w-full flex justify-end">
						{!isLoggedIn && (
							<Button variant="secondary" disabled>
								Login or register
							</Button>
						)}
					</div>
				</div>
			</nav>

			{/* main body */}
			<main className="grow flex flex-col justify-center">
				<div className="max-w-screen-lg m-auto p-4 flex items-start grow gap-3 w-full">
					{/* seating map */}
					<div
						className="bg-white rounded-md grow p-3 self-stretch shadow-sm flex flex-col gap-2"
					>
						<h2 className="text-sm font-medium mb-2">Seating</h2>

						{loading && <p>Načítám data…</p>}

						{!loading &&
							seatingRows.map((row) => (
								<div key={row.seatRow} className="flex items-center gap-2">
									<div className="w-6 text-xs text-zinc-400 text-right">{row.seatRow}</div>
									<div className="flex gap-1">
										{row.seats.map((seat) => (
											<Seat
												key={seat.seatId}
												seatData={seat}
												isInCart={!!cart[seat.seatId]}
												onToggle={() => toggleSeatInCart(seat)}
											/>
										))}
									</div>
								</div>
							))}
					</div>

					{/* event info */}
					<aside className="w-full max-w-sm bg-white rounded-md shadow-sm p-3 flex flex-col gap-2">
						{eventData?.headerImageUrl ? (
							<img
								src={eventData.headerImageUrl}
								alt=""
								className="rounded-md h-32 w-full object-cover"
							/>
						) : (
							<div className="bg-zinc-100 rounded-md h-32" />
						)}

						<h1 className="text-xl font-semibold">{eventData?.namePub}</h1>

						<p className="text-sm text-zinc-500 whitespace-pre-line">
							{eventData?.description}
						</p>

						<Button variant="secondary" disabled>
							Add to calendar
						</Button>
					</aside>
				</div>
			</main>

			{/* bottom cart */}
			<nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-center">
				<div className="max-w-screen-lg p-6 flex justify-between items-center w-full">
					<div>
            <span className="text-sm">
              Total for {totalTickets} ticket{totalTickets !== 1 && 's'}
            </span>
						<div className="text-2xl font-semibold">
							{formatCurrency(totalAmount, currency)}
						</div>
					</div>

					<Button disabled={totalTickets === 0}>Checkout now</Button>
				</div>
			</nav>
		</div>
	);
}

export default App;
