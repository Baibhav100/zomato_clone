/**
 * Inverses a name string.
 * Example: "Super Admin" -> "repuS nimdA"
 */
export const inverseName = (name) => {
    if (!name) return "";
    return name.split("").reverse().join("");
};
