const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    currency: "USD",
    style: "currency",
});

const formatCurrency = (number: number): string => {
    return CURRENCY_FORMATTER.format(number);
};

export default formatCurrency;


formatCurrency(100)  //  $100.00