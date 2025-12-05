export type Language = 'cs' | 'en';

export const uiTexts = {
    cs: {
        appName: 'NFCTRON Seating Demo',
        subtitle: 'Case study 2024 – React/TS',
        seatingTitle: 'Výběr sedadel',
        loading: 'Načítám data…',
        cartTitle: 'Košík',
        cartEmpty:
            'Zatím nemáš vybranou žádnou vstupenku. Kliknutím na sedadlo ji přidáš do košíku – opětovným kliknutím ji odebereš.',
        cartRemove: 'Odebrat',
        totalFor: (count: number) =>
            `Celkem za ${count} vstupenk${count === 1 ? 'u' : count < 5 ? 'y' : 'ek'}`,
        checkoutButton: 'Pokračovat k objednávce',
        checkoutTitle: 'Dokončení objednávky',
        checkoutSummaryIntro: 'V košíku máš',
        checkoutGuestInfo:
            'Můžeš se přihlásit testovacím účtem (tlačítko nahoře) – nebo pokračovat jako host:',
        firstName: 'Jméno',
        lastName: 'Příjmení',
        email: 'E-mail pro zaslání vstupenek',
        back: 'Zpět',
        submitOrder: 'Dokončit objednávku',
        submitting: 'Odesílám…',
        orderSuccessTitle: 'Objednávka vytvořena ✔️',
        orderFail: 'Nepodařilo se vytvořit objednávku. Zkus to prosím znovu.',
        fillAllFields: 'Vyplň prosím všechny údaje.',
        login: 'Přihlásit',
        loggingIn: 'Přihlašuji…',
        loginFail: 'Login failed: Zkontroluj přihlašovací údaje.',
        loggedInAs: 'Objednávku dokončíme na účet',
        addToCalendar: 'Přidat do kalendáře',
        ticketsWord: 'vstupenek',
        seatRow: 'Řada',
        seatPlace: 'Místo',
        seatType: 'Typ',
        seatPrice: 'Cena'

    },
    en: {
        appName: 'NFCTRON Seating Demo',
        subtitle: 'Case study 2024 – React/TS',
        seatingTitle: 'Seating',
        loading: 'Loading data…',
        cartTitle: 'Cart',
        cartEmpty:
            "You haven't selected any tickets yet. Click on a seat to add it to the cart – click again to remove it.",
        cartRemove: 'Remove',
        totalFor: (count: number) =>
            `Total for ${count} ticket${count === 1 ? '' : 's'}`,
        checkoutButton: 'Checkout now',
        checkoutTitle: 'Complete your order',
        checkoutSummaryIntro: 'You have',
        checkoutGuestInfo:
            'You can log in using the test account (button above) – or continue as a guest:',
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email to receive tickets',
        back: 'Back',
        submitOrder: 'Place order',
        submitting: 'Submitting…',
        orderSuccessTitle: 'Order created ✔️',
        orderFail: 'Could not create order. Please try again.',
        fillAllFields: 'Please fill in all required fields.',
        login: 'Login',
        loggingIn: 'Logging in…',
        loginFail: 'Login failed: Please check credentials.',
        loggedInAs: 'We will complete the order for account',
        addToCalendar: 'Add to calendar',
        ticketsWord: 'tickets',
        seatRow: 'Row',
        seatPlace: 'Seat',
        seatType: 'Type',
        seatPrice: 'Price'
    }
} as const;

export const seatTexts = {
    cs: {
        seatTitle: 'Sedadlo',
        rowLabel: 'Řada',
        placeLabel: 'Místo',
        typeLabel: 'Typ',
        priceLabel: 'Cena',
        addToCart: 'Přidat do košíku',
        removeFromCart: 'Odebrat z košíku'
    },
    en: {
        seatTitle: 'Seat',
        rowLabel: 'Row',
        placeLabel: 'Seat',
        typeLabel: 'Type',
        priceLabel: 'Price',
        addToCart: 'Add to cart',
        removeFromCart: 'Remove from cart'
    }
} as const;