/**
 * @param {string} text - The input text to be sliced
 * @param {number} [max=180] - The maximum length before truncation
 * @returns The sliced text, with an ellipsis ( ... ) appended if truncated
 */
 const textSlicer = (text: string, max: number = 180) => {
    if (text.length >= max) {
        return `${text.slice(0, max)} ...`
    }
    return text
}
export default textSlicer
