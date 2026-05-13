function calculateReadingTime(markdown) {
    const words = String(markdown || '')
        .replace(/[`#>*_[\]\(\)!-]/g, ' ')
        .split(/\s+/)
        .filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 200));
}

module.exports = {
    calculateReadingTime,
};
