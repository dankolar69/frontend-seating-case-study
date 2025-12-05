import { useState } from 'react';
import { Seat, SeatData } from '@/components/Seat.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
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
import './App.css';

type CartMap = Record<string, SeatData>;

const MOCK_SEATS: SeatData[] = Array.from({ length: 40 }, (_, index) => {
	const row = Math.floor(index / 10) + 1;
	const place = (index % 10) + 1;
	const isVip = row <= 2;

	return {
		seatId: `mock-${row}-${place}`,
		row,
		place,
		price: isVip ? 800 : 500,
		ticketTypeName: isVip ? 'VIP' : 'Standard'
	};
});

function App() {
	const isLoggedIn = false;

	const [cart, setCart] = useState<CartMap>({});

	const totalTickets = Object.keys(cart).length;
	const totalAmount = Object.values(cart).reduce((sum, seat) => sum + seat.price, 0);

	const toggleSeatInCart = (seat: SeatData) => {
		setCart((prev) => {
			if (prev[seat.seatId]) {
				const rest = { ...prev };
				delete rest[seat.seatId];
				return rest;

			}
			return {
				...prev,
				[seat.seatId]: seat
			};
		});
	};

	return (
		<div className="flex flex-col grow min-h-screen bg-zinc-50">
			{/* header (wrapper) */}
			<nav className="sticky top-0 left-0 right-0 bg-white border-b border-zinc-200 flex justify-center">
				{/* inner content */}
				<div className="max-w-screen-lg p-4 grow flex items-center justify-between gap-3">
					{/* application/author image/logo placeholder */}
					<div className="max-w-[250px] w-full flex items-center gap-2">
						<div className="bg-violet-600 rounded-md size-12 flex items-center justify-center text-white font-bold text-xl">
							N
						</div>
						<div className="hidden sm:flex flex-col">
							<span className="font-semibold text-zinc-900">NFCTRON Seating Demo</span>
							<span className="text-xs text-zinc-500">Case study 2024 – React/TS</span>
						</div>
					</div>
					{/* app/author title/name placeholder */}
					<div className="bg-zinc-100 rounded-md h-8 w-[200px]" />
					{/* user menu */}
					<div className="max-w-[250px] w-full flex justify-end">
						{isLoggedIn ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost">
										<div className="flex items-center gap-2">
											<Avatar>
												<AvatarImage src={`https://source.boringavatars.com/marble/120/<user-email>?colors=25106C,7F46DB`} />
												<AvatarFallback>CN</AvatarFallback>
											</Avatar>

											<div className="flex flex-col text-left">
												<span className="text-sm font-medium">John Doe</span>
												<span className="text-xs text-zinc-500">john.doe@nfctron.com</span>
											</div>
										</div>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-[250px]">
									<DropdownMenuLabel>John Doe</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										<DropdownMenuItem disabled>Logout</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Button disabled variant="secondary">
								Login or register
							</Button>
						)}
					</div>
				</div>
			</nav>

			{/* main body (wrapper) */}
			<main className="grow flex flex-col justify-center">
				{/* inner content */}
				<div className="max-w-screen-lg m-auto p-4 flex items-start grow gap-3 w-full">
					{/* seating card */}
					<div
						className="bg-white rounded-md grow p-3 self-stretch shadow-sm grid gap-2"
						style={{
							gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
							gridAutoRows: '40px'
						}}
					>
						{/*	seating map */}
						{MOCK_SEATS.map((seat) => (
							<Seat
								key={seat.seatId}
								seatData={seat}
								isInCart={!!cart[seat.seatId]}
								onToggle={() => toggleSeatInCart(seat)}
							/>
						))}
					</div>

					{/* event info */}
					<aside className="w-full max-w-sm bg-white rounded-md shadow-sm p-3 flex flex-col gap-2">
						{/* event header image placeholder */}
						<div className="bg-zinc-100 rounded-md h-32" />
						{/* event name */}
						<h1 className="text-xl text-zinc-900 font-semibold">[event-name]</h1>
						{/* event description */}
						<p className="text-sm text-zinc-500">
							[event-description]: Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam aliquid asperiores
							beatae deserunt dicta dolorem eius eos fuga laborum nisi officia pariatur quidem repellendus, reprehenderit
							sapiente, sed tenetur vel voluptatibus?
						</p>
						{/* add to calendar button */}
						<Button variant="secondary" disabled>
							Add to calendar
						</Button>
					</aside>
				</div>
			</main>

			{/* bottom cart affix (wrapper) */}
			<nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-center">
				{/* inner content */}
				<div className="max-w-screen-lg p-6 flex justify-between items-center gap-4 grow">
					{/* total in cart state */}
					<div className="flex flex-col">
            <span>
              Total for {totalTickets} ticket{totalTickets === 1 ? '' : 's'}
            </span>
						<span className="text-2xl font-semibold">
              {totalAmount.toLocaleString('cs-CZ')} CZK
            </span>
					</div>

					{/* checkout button */}
					<Button variant="default" disabled={totalTickets === 0}>
						Checkout now
					</Button>
				</div>
			</nav>
		</div>
	);
}

export default App;
