/**
 *
 * @param difficulty: double between 0 and 10
 * @returns {string} difficulty color code
 */
export function difficultyToColorMapping(difficulty) {
    let colors = [
        "#009934",
        "#00BF41",
        "#00C207",
        "#33C600",
        "#aeca03",
        "#ceca44",
        "#f9f800",
        "#FFAC4C",
        "#D57300",
        "#cc3202",
        "#ed000d"
    ];
    return colors[Math.floor(difficulty)]

}