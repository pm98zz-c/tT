/**
 * Static utilities.
 */
class Utils {
  public static trim(str: string, chars: string = "\\s"): string {
    return Utils.ltrim(Utils.rtrim(str, chars), chars);
  }

  public static ltrim(str: string, chars: string = "\\s"): string {
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
  }

  public static rtrim(str: string, chars: string = "\\s") {
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
  }
  /**
   * https://developer.mozilla.org/en/docs/Web/API/HTMLTextAreaElement
   *
   */
  public static autoGrowTextArea(textArea: HTMLTextAreaElement) {
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
  }
}
export default Utils