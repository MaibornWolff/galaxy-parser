import getFileHandler from "myModule";

try {
    const fileHanlder = getFileHandler("not_existing_file", "r");
    throw new Error("another exception");
} catch (error) {
    // do nothing
} finally {
    // do nothing
}
