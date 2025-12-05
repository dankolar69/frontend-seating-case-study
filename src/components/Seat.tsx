import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { cn } from '@/lib/utils.ts';
import React, {useState} from 'react';
import { Language, seatTexts } from '@/lib/data.ts';

export type SeatData = {
	seatId: string;
	row: number;
	place: number;
	price: number;
	ticketTypeName: string;
};

interface SeatProps extends React.HTMLAttributes<HTMLDivElement> {
	seatData: SeatData;
	isInCart: boolean;
	onToggle: () => void;
	lang: Language;
	currency: string;
}

export const Seat = React.forwardRef<HTMLDivElement, SeatProps>((props, ref) => {
	const { seatData, isInCart, onToggle, className, lang, currency, ...rest } = props;
	const tr = seatTexts[lang];

	//Close modal when adding/removing seat
	const [isPopoverOpen, setPopoverOpen] = useState(false);
	const handleToggle = () => {
		onToggle();
		setPopoverOpen(false);
	};

	return (
		<Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
			<PopoverTrigger asChild>
				<div
					ref={ref}
					{...rest}
					className={cn(
						'size-8 rounded-full flex items-center justify-center text-center cursor-pointer transition-colors',
						isInCart
							? 'bg-violet-600 text-white'
							: 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200',
						className
					)}
				>
					<span className="text-xs font-medium">{seatData.place}</span>
				</div>
			</PopoverTrigger>

			<PopoverContent className="w-64">
				<div className="mb-3 text-sm">
					<div className="font-medium mb-1">{tr.seatTitle}</div>
					<div className="text-xs text-zinc-600">
						{tr.rowLabel}{' '}
						<strong>{seatData.row}</strong>, {tr.placeLabel.toLowerCase()}{' '}
						<strong>{seatData.place}</strong>
					</div>
					<div className="text-xs text-zinc-600">
						{tr.typeLabel}: <strong>{seatData.ticketTypeName}</strong>
					</div>
					<div className="text-xs text-zinc-600">
						{tr.priceLabel}:{' '}
						<strong>
							{seatData.price} {currency}
						</strong>
					</div>
				</div>

				{/*<pre className="text-[10px] bg-zinc-50 rounded p-2 mb-3 overflow-auto max-h-32">
{JSON.stringify({ seatData }, null, 2)}
        </pre>*/}

				<footer className="flex flex-col">
					{isInCart ? (
						<Button variant="destructive" size="sm" onClick={handleToggle}>
							{tr.removeFromCart}
						</Button>
					) : (
						<Button variant="default" size="sm" onClick={handleToggle}>
							{tr.addToCart}
						</Button>
					)}
				</footer>
			</PopoverContent>
		</Popover>
	);
});

Seat.displayName = 'Seat';
