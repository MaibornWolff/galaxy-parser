module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "body-case": [2, "always", "sentence-case"],
        "body-max-line-length": [2, "always", 72],
        "header-max-length": [2, "always", 72],
        "footer-max-length": [2, "always", 52],
        "type-enum": [2, "always", getTypes()],
        "issue-id-required": [2, "always"],
    },
    plugins: ["issue-id-required"],
};
function getTypes() {
    const baseTypes = [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
    ];
    baseTypes.push(...baseTypes.map((type) => `${type}!`));
    return baseTypes.map((type) => `${type}!`);
}
