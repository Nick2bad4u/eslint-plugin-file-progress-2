// @ts-check

/**
 * @typedef {{ marker: "`" | "~"; length: number }} FenceState
 */

/**
 * Escape MDX-significant characters in TypeDoc signature-like lines while
 * preserving inline code spans.
 *
 * @param {string} line
 *
 * @returns {string}
 */
export function escapeMdxSyntaxInSignatureLine(line) {
    let escapedLine = "";
    let index = 0;
    /** @type {null | number} */
    let codeSpanLength = null;

    const countRun = (
        /** @type {number} */ startIndex,
        /** @type {string} */ char
    ) => {
        let count = 0;

        while (
            startIndex + count < line.length &&
            line.charAt(startIndex + count) === char
        ) {
            count += 1;
        }

        return count;
    };

    while (index < line.length) {
        const tickRun = line.charAt(index) === "`" ? countRun(index, "`") : 0;

        if (tickRun > 0) {
            if (codeSpanLength === null) {
                codeSpanLength = tickRun;
            } else if (tickRun === codeSpanLength) {
                codeSpanLength = null;
            }

            escapedLine += line.slice(index, index + tickRun);
            index += tickRun;
            continue;
        }

        const character = line.charAt(index);

        if (codeSpanLength === null) {
            switch (character) {
                case "<": {
                    escapedLine += "&lt;";
                    break;
                }

                case "{": {
                    escapedLine += "&#123;";
                    break;
                }

                case "}": {
                    escapedLine += "&#125;";
                    break;
                }

                default: {
                    escapedLine += character;
                }
            }
        } else {
            escapedLine += character;
        }

        index += 1;
    }

    return escapedLine;
}

/**
 * @param {string} line
 *
 * @returns {boolean}
 */
function isSignatureLikeLine(line) {
    const trimmedLine = line.trimStart();

    return (
        (trimmedLine.startsWith(">") || trimmedLine.startsWith("- ")) &&
        /[<{}]/u.test(trimmedLine)
    );
}

/**
 * @param {string} line
 *
 * @returns {null | FenceState}
 */
function getFenceState(line) {
    const trimmedLine = line.trimStart();
    const match = /^([`~]{3,})/u.exec(trimmedLine);

    if (match === null) {
        return null;
    }

    const markerRun = match[1];

    if (markerRun === undefined) {
        return null;
    }

    return {
        length: markerRun.length,
        marker: /** @type {"`" | "~"} */ (markerRun[0]),
    };
}

/**
 * Escape MDX-significant characters in generated TypeDoc markdown lines that
 * look like declaration signatures.
 *
 * @param {string} markdown
 *
 * @returns {string}
 */
export function escapeMdxSyntaxInTypeDocMarkdown(markdown) {
    const lines = markdown.split(/\r?\n/u);
    /** @type {FenceState | null} */
    let activeFenceState = null;

    return lines
        .map((line) => {
            const fenceState = getFenceState(line);

            if (fenceState !== null) {
                if (
                    activeFenceState !== null &&
                    activeFenceState.marker === fenceState.marker &&
                    fenceState.length >= activeFenceState.length
                ) {
                    activeFenceState = null;
                } else if (activeFenceState === null) {
                    activeFenceState = fenceState;
                }

                return line;
            }

            if (activeFenceState !== null || !isSignatureLikeLine(line)) {
                return line;
            }

            return escapeMdxSyntaxInSignatureLine(line);
        })
        .join("\n");
}
