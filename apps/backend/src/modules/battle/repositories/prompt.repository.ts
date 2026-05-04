import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { SupabaseService } from "../../storage/supabase/supabase.service";
import { DEFAULT_PROMPTS } from "../constants/default-prompts";
import type { PromptSnapshot } from "../types/prompt-snapshot";

type PromptRecord = {
  content: string;
  content_length: number | null;
  id: number;
  slug: string;
  title: string;
};

@Injectable()
export class PromptRepository {
  private readonly logger = new Logger(PromptRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getRandomPrompt() {
    const promptPool = await this.getActivePromptPool();

    if (promptPool.length === 0) {
      throw new InternalServerErrorException("No active prompts are available.");
    }

    const prompt = promptPool[this.getRandomIndex(promptPool.length)];

    if (!prompt) {
      throw new InternalServerErrorException("Failed to pick a prompt from the active pool.");
    }

    return prompt;
  }

  private async getActivePromptPool() {
    const supabaseClient = this.supabaseService.optionalInstance;

    if (!supabaseClient) {
      return DEFAULT_PROMPTS;
    }

    const { data, error } = await supabaseClient
      .from("prompts")
      .select("id, slug, title, content, content_length")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) {
      if (this.isMissingPromptTableError(error)) {
        this.logger.warn(
          "The prompts table does not exist in Supabase yet. Falling back to built-in prompts.",
        );

        return DEFAULT_PROMPTS;
      }

      throw new InternalServerErrorException(`Failed to load prompts: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return DEFAULT_PROMPTS;
    }

    return data.map((promptRecord) => this.toPromptSnapshot(promptRecord as PromptRecord));
  }

  private getRandomIndex(promptCount: number) {
    return Math.floor(Math.random() * promptCount);
  }

  private isMissingPromptTableError(error: { code?: string; message: string }) {
    return (
      error.code === "PGRST205" ||
      error.message.includes("Could not find the table 'public.prompts'") ||
      error.message.includes('relation "public.prompts" does not exist')
    );
  }

  private toPromptSnapshot(promptRecord: PromptRecord): PromptSnapshot {
    return {
      content: promptRecord.content,
      contentLength: promptRecord.content_length ?? promptRecord.content.length,
      id: Number(promptRecord.id),
      slug: promptRecord.slug,
      title: promptRecord.title,
    };
  }
}
