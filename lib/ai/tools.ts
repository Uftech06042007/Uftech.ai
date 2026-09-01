import type Anthropic from "@anthropic-ai/sdk";
import { CONTACT_HELP_OPTIONS } from "@/lib/data";

export const OPEN_LEAD_FORM = "open_lead_form";

export const chatTools: Anthropic.Tool[] = [
  {
    name: OPEN_LEAD_FORM,
    description:
      "Open the inline contact form in the chat so the visitor can hand over their details step by step. Call this as soon as they want to be contacted, get a quote, book a call, or ask something only a person can answer — do not collect their details by asking in chat. Pass along anything they have already told you so those steps come pre-filled. The form itself confirms delivery, so do not claim their details have been sent.",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Their name, if they already gave it. Omit otherwise — never guess.",
        },
        email: {
          type: "string",
          description: "Their email, if they already gave it. Omit otherwise.",
        },
        company: {
          type: "string",
          description: "Their company, if mentioned. Omit otherwise.",
        },
        topic: {
          type: "string",
          enum: CONTACT_HELP_OPTIONS,
          description:
            "Closest matching practice for what they asked about, used to preselect the form's topic.",
        },
        message: {
          type: "string",
          description:
            "One or two sentences summarising what they need, based on the conversation so far, used to pre-fill the last step.",
        },
      },
      required: [],
    },
  },
];
