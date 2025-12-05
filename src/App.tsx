import  { useEffect, useMemo, useState } from 'react';
import { Seat, SeatData } from '@/components/Seat.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
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
type LoginResponse = {
	message: string;
	user: {
		firstName: string;
		lastName: string;
		email: string;
	};
};
type OrderRequest = {
	eventId: string;
	tickets: {
		ticketTypeId: string;
		seatId: string;
	}[];
	user: {
		email: string;
		firstName: string;
		lastName: string;
	};
};

type OrderResponse = {
	message: string;
	orderId: string;
	tickets: unknown[];
	user: {
		email: string;
		firstName: string;
		lastName: string;
	};
	totalAmount: number;
};
type CheckoutStep = 'idle' | 'details' | 'submitting' | 'success' | 'error';


// ======================
// Helpers
// ======================
async function apiGet<T>(path: string): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`);
	if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
	return res.json();
}
async function apiPost<T>(path: string, body: unknown): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `POST ${path} failed: ${res.status}`);
	}
	return res.json();
}

function formatCurrency(value: number, currency: string) {
	return new Intl.NumberFormat('cs-CZ', {
		style: 'currency',
		currency
	}).format(value);
}
// ICS "Add to calendar"
function downloadIcsForEvent(event: EventResponse) {
	const start = new Date(event.dateFrom);
	const end = new Date(event.dateTo);

	const toIcsDateTime = (d: Date) => {
		const pad = (n: number) => String(n).padStart(2, '0');
		return (
			d.getUTCFullYear().toString() +
			pad(d.getUTCMonth() + 1) +
			pad(d.getUTCDate()) +
			'T' +
			pad(d.getUTCHours()) +
			pad(d.getUTCMinutes()) +
			pad(d.getUTCSeconds()) +
			'Z'
		);
	};

	const dtStart = toIcsDateTime(start);
	const dtEnd = toIcsDateTime(end);

	const icsLines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//NFCTRON//Seating Case Study//CS',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${event.eventId}`,
		`SUMMARY:${event.namePub.replace(/\r?\n/g, ' ')}`,
		`DESCRIPTION:${event.description.replace(/\r?\n/g, '\\n')}`,
		`LOCATION:${event.place.replace(/\r?\n/g, ' ')}`,
		`DTSTART:${dtStart}`,
		`DTEND:${dtEnd}`,
		'END:VEVENT',
		'END:VCALENDAR'
	];

	const blob = new Blob([icsLines.join('\r\n')], {
		type: 'text/calendar;charset=utf-8'
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${event.namePub}.ics`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

// ======================
// Component
// ======================

function App() {

	//Login state
	const [user, setUser] = useState<LoginResponse['user'] | null>(null);
	const[loginLoading, setLoginLoading]=useState(false);

	const handleLogin = async () => {
		setLoginLoading(true);
		try {
			const res = await apiPost<LoginResponse>('/login', {
				email: 'frontend@nfctron.com',
				password: 'Nfctron2025'
			});
			setUser(res.user);
		} catch (e) {
			console.error('Login failed', e);
			alert('Login failed: Zkontroluj přihlašovací údaje.');
		} finally {
			setLoginLoading(false);
		}
	};

	const handleLogout = () => {
		setUser(null);
	};

	// API data
	const [eventData, setEventData] = useState<EventResponse | null>(null);
	const [ticketsData, setTicketsData] = useState<EventTicketsResponse | null>(null);
	const [loading, setLoading] = useState(true);

	// Cart
	const [cart, setCart] = useState<Record<string, SeatData>>({});
	const cartItems = useMemo(
		() =>
			Object.values(cart).sort(
				(a, b) => a.row - b.row || a.place - b.place
			),
		[cart]
	);

	const totalTickets = Object.keys(cart).length;
	const totalAmount = Object.values(cartItems).reduce((sum, seat) => sum + seat.price, 0);
	const currency = eventData?.currencyIso ?? 'CZK';

	// CHECKOUT STATE
	const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle');
	const [guestFirstName, setGuestFirstName] = useState('');
	const [guestLastName, setGuestLastName] = useState('');
	const [guestEmail, setGuestEmail] = useState('');
	const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
	const [orderError, setOrderError] = useState<string | null>(null);

	const openCheckout = () => {
		if (totalTickets === 0 || !eventData) return;
		setCheckoutStep('details');
		setOrderResult(null);
		setOrderError(null);

		if (user) {
			setGuestFirstName(user.firstName);
			setGuestLastName(user.lastName);
			setGuestEmail(user.email);
		}
	};
	const closeCheckout = () => {
		if (checkoutStep === 'submitting') return;
		setCheckoutStep('idle');
	};

	const handleSubmitOrder = async () => {
		if (!eventData || totalTickets === 0) return;

		const usedUser = user
			? {
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName
			}
			: {
				email: guestEmail.trim(),
				firstName: guestFirstName.trim(),
				lastName: guestLastName.trim()
			};

		if (!usedUser.email || !usedUser.firstName || !usedUser.lastName) {
			setOrderError('Vyplň prosím všechny údaje.');
			return;
		}

		const body: OrderRequest = {
			eventId: eventData.eventId,
			tickets: Object.values(cart).map((seat) => {
				const ticketType = ticketsData?.ticketTypes.find(
					(t) => t.name === seat.ticketTypeName && t.price === seat.price
				);
				return {
					ticketTypeId: ticketType ? ticketType.id : '', // fallback, ale v datech by měl existovat
					seatId: seat.seatId
				};
			}),
			user: usedUser
		};

		try {
			setCheckoutStep('submitting');
			setOrderError(null);
			const res = await apiPost<OrderResponse>('/order', body);
			setOrderResult(res);
			setCheckoutStep('success');
			setCart({});
		} catch (e) {
			console.error('Order failed', e);
			setOrderError('Nepodařilo se vytvořit objednávku. Zkus to prosím znovu.');
			setCheckoutStep('error');
		}
	};

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

					{/* Right side login menu */}
					<div className="flex items-center gap-4">
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost">
										<div className="flex items-center gap-2">
											<Avatar>
												<AvatarImage src={`https://source.boringavatars.com/marble/120/${user.email}`} />
												<AvatarFallback>
													{user.firstName[0]}
													{user.lastName[0]}
												</AvatarFallback>
											</Avatar>

											<div className="flex flex-col text-left">
                        <span className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </span>
												<span className="text-xs text-zinc-500">{user.email}</span>
											</div>
										</div>
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent className="w-48">
									<DropdownMenuLabel>Logged in</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										<DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Button onClick={handleLogin} disabled={loginLoading}>
								{loginLoading ? 'Logging in…' : 'Login'}
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
						{/* Cart management */}
						<div className="mt-4 border-t border-zinc-100 pt-3">
							<h3 className="text-sm font-semibold text-zinc-900 mb-2">
								Košík
							</h3>

							{cartItems.length === 0 ? (
								<p className="text-xs text-zinc-500">
									Zatím nemáš vybranou žádnou vstupenku. Kliknutím na sedadlo
									ji přidáš do košíku – opětovným kliknutím ji odebereš.
								</p>
							) : (
								<div className="max-h-48 overflow-auto rounded-md border border-zinc-100">
									<table className="w-full text-xs">
										<thead className="bg-zinc-50 text-zinc-500">
										<tr>
											<th className="text-left px-2 py-1">Řada</th>
											<th className="text-left px-2 py-1">Místo</th>
											<th className="text-left px-2 py-1">Typ</th>
											<th className="text-right px-2 py-1">Cena</th>
											<th className="px-2 py-1" />
										</tr>
										</thead>
										<tbody>
										{cartItems.map((item) => (
											<tr
												key={item.seatId}
												className="border-t border-zinc-100"
											>
												<td className="px-2 py-1 text-zinc-600">{item.row}</td>
												<td className="px-2 py-1 text-zinc-600">{item.place}</td>
												<td className="px-2 py-1 text-zinc-600">{item.ticketTypeName}</td>
												<td className="px-2 py-1 text-right text-black">
													{formatCurrency(item.price, currency)}
												</td>
												<td className="px-2 py-1 text-right text-black">
													<Button
														variant="outline"
														size="sm"
														onClick={() => toggleSeatInCart(item)}
													>
														Odebrat
													</Button>
												</td>
											</tr>
										))}
										</tbody>
									</table>
								</div>
							)}
						</div>

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

						<h1 className="text-xl font-semibold text-black">{eventData?.namePub}</h1>

						<p className="text-sm text-zinc-500 whitespace-pre-line">
							{eventData?.description}
						</p>

						<Button
							variant="secondary"
							disabled={!eventData}
							onClick={() => eventData && downloadIcsForEvent(eventData)}
						>
							Add to calendar
						</Button>
					</aside>
				</div>
			</main>

			{/* bottom cart */}
			<nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-center">
				<div className="max-w-screen-lg p-6 flex justify-between items-center w-full gap-4">
					<div>
            <span className="text-sm text-zinc-600">
              Total for {totalTickets} ticket{totalTickets !== 1 && 's'}
            </span>
						<div className="text-2xl font-semibold text-black">
							{formatCurrency(totalAmount, currency)}
						</div>
					</div>

					<Button
						disabled={totalTickets === 0 || !eventData}
						onClick={openCheckout}
					>
						Checkout now
					</Button>
				</div>
			</nav>

			{/* Checkout Modal */}
			{checkoutStep !== 'idle' && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
					<div className="bg-white max-w-md w-full mx-4 rounded-lg shadow-lg p-4 sm:p-6 relative">
						<button
							type="button"
							className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-600 text-xl"
							onClick={closeCheckout}
							disabled={checkoutStep === 'submitting'}
							aria-label="Zavřít"
						>
							×
						</button>

						<h2 className="text-lg font-semibold mb-1 text-black">Dokončení objednávky</h2>
						<p className="text-xs text-zinc-500 mb-3">
							V košíku máš {totalTickets} vstupenk
							{totalTickets === 1 ? 'u' : totalTickets < 5 ? 'y' : 'ek'} za{' '}
							{formatCurrency(totalAmount, currency)}.
						</p>

						{orderResult && checkoutStep === 'success' && (
							<div
								className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
								<p className="font-medium mb-1">Objednávka vytvořena ✔️</p>
								<p className="break-all text-xs">
									ID objednávky: {orderResult.orderId}
								</p>
								<p className="text-xs mt-1">
									Na email <strong>{orderResult.user.email}</strong> ti přijde
									potvrzení.
								</p>
							</div>
						)}

						{orderError && (
							<div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
								{orderError}
							</div>
						)}

						{checkoutStep !== 'success' && (
							<>
								{!user && (
									<div className="mb-4 rounded-md border border-zinc-200 p-3 flex flex-col gap-2">
										<p className="text-xs text-zinc-600">
											Můžeš se přihlásit testovacím účtem (tlačítko nahoře) –
											nebo pokračovat jako host:
										</p>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
											<div className="flex flex-col gap-1">
												<label className="text-xs text-zinc-600">Jméno</label>
												<input
													className="border rounded-md px-2 py-1 text-sm"
													value={guestFirstName}
													onChange={(e) =>
														setGuestFirstName(e.target.value)
													}
													placeholder="Jan"
												/>
											</div>
											<div className="flex flex-col gap-1">
												<label className="text-xs text-zinc-600">Příjmení</label>
												<input
													className="border rounded-md px-2 py-1 text-sm"
													value={guestLastName}
													onChange={(e) =>
														setGuestLastName(e.target.value)
													}
													placeholder="Novák"
												/>
											</div>
										</div>
										<div className="flex flex-col gap-1">
											<label className="text-xs text-zinc-600">
												E-mail pro zaslání vstupenek
											</label>
											<input
												className="border rounded-md px-2 py-1 text-sm"
												value={guestEmail}
												onChange={(e) => setGuestEmail(e.target.value)}
												type="email"
												placeholder="jan.novak@example.com"
											/>
										</div>
									</div>
								)}

								{user && (
									<div
										className="mb-4 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
										Objednávku dokončíme na účet{' '}
										<strong>
											{user.firstName} {user.lastName}
										</strong>{' '}
										(<span className="font-mono">{user.email}</span>).
									</div>
								)}

								<div className="flex justify-end gap-2 text-black">
									<Button
										variant="outline"
										onClick={closeCheckout}
										disabled={checkoutStep === 'submitting'}
									>
										Zpět
									</Button>
									<Button
										onClick={handleSubmitOrder}
										disabled={
											checkoutStep === 'submitting' || totalTickets === 0
										}
									>
										{checkoutStep === 'submitting'
											? 'Odesílám…'
											: 'Dokončit objednávku'}
									</Button>
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
