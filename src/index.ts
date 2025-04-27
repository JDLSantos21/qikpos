import { BarcodeType, CodePage, Command, PrintStyle } from "./types";

class CMD {
  static initialize(): { cmd: Command } {
    return { cmd: "Initialize" };
  }

  static printLine(text: string): { cmd: Command; value: string } {
    return { cmd: "PrintLine", value: text };
  }

  static feedLines(qty: number): { cmd: Command; value: string } {
    if (qty < 1 || qty > 10) {
      throw new Error("Quantity must be between 1 and 10.");
    }

    let stringQty = String(qty);

    return { cmd: "FeedLines", value: stringQty };
  }

  static codePage(code: CodePage): { cmd: Command; value: CodePage } {
    return { cmd: "CodePage", value: code };
  }

  static printImage(base64: string): { cmd: Command; value: string } {
    return { cmd: "PrintImage", value: base64 };
  }

  static QRCode(value: string): { cmd: Command; value: string } {
    return { cmd: "PrintQRCode", value: value };
  }

  static barcode(
    value: string,
    type: BarcodeType
  ): { cmd: Command; value: string; type: BarcodeType } {
    return { cmd: "PrintBarcode", value: value, type: type };
  }

  static setStyle(style: PrintStyle): {
    cmd: Command;
    value: PrintStyle;
  } {
    return { cmd: "SetStyles", value: style };
  }

  static leftAlign(): { cmd: Command } {
    return { cmd: "LeftAlign" };
  }

  static centerAlign(): { cmd: Command } {
    return { cmd: "CenterAlign" };
  }

  static rightAlign(): { cmd: Command } {
    return { cmd: "RightAlign" };
  }

  static clear(): { cmd: Command } {
    return { cmd: "Clear" };
  }

  static fullCut(): { cmd: Command } {
    return { cmd: "FullCut" };
  }
}

export default CMD;
