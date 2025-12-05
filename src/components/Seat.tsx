import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { cn } from '@/lib/utils.ts';
import React from 'react';

type SeatData = {
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
}

export const Seat = React.forwardRef<HTMLDivElement, SeatProps>((props, ref) => {
	const { seatData, isInCart, onToggle, className, ...rest } = props;

	return (
		<Popover>
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
					<div className="font-medium mb-1">Sedadlo</div>
					<div className="text-xs text-zinc-600">
						Řada <strong>{seatData.row}</strong>, místo{' '}
						<strong>{seatData.place}</strong>
					</div>
					<div className="text-xs text-zinc-600">
						Typ: <strong>{seatData.ticketTypeName}</strong>
					</div>
					<div className="text-xs text-zinc-600">
						Cena: <strong>{seatData.price} Kč</strong>
					</div>
				</div>

				<pre className="text-[10px] bg-zinc-50 rounded p-2 mb-3 overflow-auto max-h-32">
{JSON.stringify({ seatData }, null, 2)}
        </pre>

				<footer className="flex flex-col">
					{isInCart ? (
						<Button variant="destructive" size="sm" onClick={onToggle}>
							Remove from cart
						</Button>
					) : (
						<Button variant="default" size="sm" onClick={onToggle}>
							Add to cart
						</Button>
					)}
				</footer>
			</PopoverContent>
		</Popover>
	);
});

Seat.displayName = 'Seat';
