import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePrinterDto } from "./dto/create-printer.dto";
import { UpdatePrinterDto } from "./dto/update-printer.dto";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

@Injectable()
export class PrintersService {
  constructor(private prisma: PrismaService) {}

  async create(createPrinterDto: CreatePrinterDto) {
    return this.prisma.printer.create({
      data: createPrinterDto,
    });
  }

  async findAll(companyId: string) {
    return this.prisma.printer.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.printer.findUnique({
      where: { id },
    });
  }

  async update(id: string, updatePrinterDto: UpdatePrinterDto) {
    return this.prisma.printer.update({
      where: { id },
      data: updatePrinterDto,
    });
  }

  async remove(id: string) {
    return this.prisma.printer.delete({
      where: { id },
    });
  }

  async getSystemPrinters() {
    try {
      // PowerShell command to list printer names
      // -Name "*" gets all. We format as JSON for easier parsing or just lines.
      // simpler: Get-Printer | Select-Object -ExpandProperty Name
      const { stdout } = await execAsync(
        'powershell -Command "Get-Printer | Select-Object -ExpandProperty Name"'
      );

      // Split by new line and filter empty
      const printers = stdout
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");
      return printers;
    } catch (error) {
      console.error("Error fetching system printers:", error);
      throw new InternalServerErrorException(
        "Falha ao listar impressoras do sistema"
      );
    }
  }

  async testPrint(id: string) {
    const printer = await this.findOne(id);
    if (!printer) {
      throw new Error("Printer not found");
    }

    const testContent = `
================================
      TESTE DE IMPRESSAO
================================
Impressora: ${printer.name}
Sistema: ${printer.systemName}
Tipo: ${printer.type}
Formato: ${printer.format}
Data: ${new Date().toLocaleString()}
================================
    Se voce consegue ler isso,
    a configuracao esta OK!
================================
    `;

    // Create temp file
    const tempFile = path.join(
      os.tmpdir(),
      `test_print_${id}_${Date.now()}.txt`
    );
    // Write with BOM for PowerShell compatibility or just UTF8
    fs.writeFileSync(tempFile, testContent, { encoding: "utf8" });

    try {
      // Use PowerShell Out-Printer. It is much more robust than 'print /D'.
      const psCommand = `powershell -Command "Get-Content -Path '${tempFile}' | Out-Printer -Name '${printer.systemName}'"`;

      console.log(`Executing print command: ${psCommand}`);
      const { stdout, stderr } = await execAsync(psCommand);

      if (stderr) console.error("Print Error:", stderr);

      // Cleanup
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {}

      return {
        success: true,
        message: "Comando de impressão enviado para a fila.",
      };
    } catch (error) {
      console.error("Print execution failed:", error);
      throw new InternalServerErrorException(
        "Falha ao enviar para impressora: " + error.message
      );
    }
  }

  async printText(printerId: string, text: string) {
    const printer = await this.findOne(printerId);
    if (!printer) throw new Error("Printer not found");

    const tempFile = path.join(
      os.tmpdir(),
      `print_${printerId}_${Date.now()}.txt`
    );
    fs.writeFileSync(tempFile, text, { encoding: "utf8" });

    try {
      const psCommand = `powershell -Command "Get-Content -Path '${tempFile}' | Out-Printer -Name '${printer.systemName}'"`;
      console.log(`[PrintText] Executing: ${psCommand}`);
      await execAsync(psCommand);
      console.log(`[PrintText] Success for ${printer.systemName}`);
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {}
    } catch (error) {
      console.error(
        `[PrintText] Failed to print text to ${printer.systemName}:`,
        error
      );
    }
  }
}
