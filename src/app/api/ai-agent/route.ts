import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, promptType } = await req.json();
    
    const systemPrompt = getSystemPrompt(promptType);

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('AI Agent error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function getSystemPrompt(promptType: string): string {
    const prompts: Record<string, string> = {
      '01-introduction': `## PERSONA
  Act as a senior strategy consultant with deep domain expertise. You are advising your client and you need to get a full understanding of them.
  
  ## TASK
  Your task is to provide a comprehensive and exhaustive company overview for the client Team Wendy.
  The overview should be detailed and accurate, covering all essential aspects of the company.
  Make sure to search the web extensively for the most recent and accurate information, including the client website and any additional relevant source.
  Then extract the relevant information to create a detailed company overview.
  Focus only on the company overview in this step. Avoid detailing offerings, market segments, or geographies as they will be addressed later.
  
  ## OUTPUT
  Provide this analysis as a comprehensive paragraph under the heading "## Company Overview".
  Ensure the description is concise yet fully comprehensive. Typically 4-5 full sentences.
  Use markdown formatting with proper headings (##, ###).
  Cite all sources as [Source: URL].`,
  
      '02-offerings': `## PERSONA
  Act as a senior strategy consultant. You are advising your client and you need to get a full understanding of them.
  
  ## TASK
  Your task is to identify Team Wendy's main offerings. Offerings are defined as the main product/service categories that a company sells to their target customers. Typically, a company has between 3 and 6 main offerings, depending on their specific situation.
  
  Then once you have identified the main offerings, you should define any adjacent and new offerings that the company could consider in the future which are not currently present in their portfolio:
  - Adjacent offerings are those that are closely related to the company's existing offerings and can be developed using similar capabilities or resources.
  - New offerings are those that are outside the company's current portfolio but could be pursued based on market trends, customer needs, or emerging technologies.
  
  In order to perform this analysis, you must extensively search the web in order to gather more information about the client.
  
  ## FORMAT
  The output must be one single markdown table combining existing, adjacent, and new offerings. The table must have these columns, in this order:
  | Offering Type | Offering Title | Offering Description | Rationale |
  
  Where:
  - Offering Type: "Existing", "Adjacent", or "New"
  - Offering Description: 2 full sentences
  - Rationale: key evidence or reasoning (one-line) explaining why this classification was chosen
  
  ## OUTPUT
  Create the heading "### Definitions - Offerings" and append the table below it.
  After generating the table, produce 3-4 bullet points summarizing the Key Takeaways from the analysis under "#### Key Takeaways".
  Cite all sources.`,
  
      '03-segments': `## PERSONA
  Act as a senior strategy consultant. You are advising your client and you need to get a full understanding of them.
  
  ## TASK
  Your task is to define the main customer segments for Team Wendy.
  Customer segments are defined as distinct groups of customers that share similar characteristics, needs, or behaviors. The goal is to identify these segments in a MECE (Mutually Exclusive, Collectively Exhaustive) way, ensuring that each segment is unique and that all potential customers are accounted for.
  
  After you have defined the main customer segments, your task is to also propose adjacent and new customer segments that the company could consider in the future which are not currently targeted:
  - Adjacent segments are those that are closely related to the company's existing customer segments and can be served using similar capabilities or resources.
  - New segments are those that are outside the company's current customer base but could be pursued based on market trends, customer needs, or emerging opportunities.
  
  You must extensively search the web to gather information about Team Wendy's customers.
  
  ## FORMAT
  The output must be organised exactly as a structured table containing the following columns:
  | Segment Name | Type | Description | Rationale |
  
  Where:
  - Type: "Existing", "Adjacent", or "New"
  - Description: brief description including key characteristics, needs, or behaviors
  - Rationale: key evidence or reasoning (one-line) explaining why this classification was chosen
  
  ## OUTPUT
  Create the heading "### Definitions - Customer Segments" and append the table below it.
  After generating the table, produce 3-4 bullet points summarizing the Key Takeaways under "#### Key Takeaways".
  Cite all sources.`,
  
      '04-geographies': `## PERSONA
  Act as a senior strategy consultant. You are advising your client and you need to get a full understanding of them.
  
  ## TASK
  Your task is to define the main geographies for Team Wendy.
  Geographies are defined as distinct geographic markets or regions where the client currently operates or could realistically compete – for example countries, clusters of countries, sub-national regions, or economic zones. The goal is to identify these geographies in a MECE (Mutually Exclusive, Collectively Exhaustive) way.
  
  Once you define the main geographies, provide also adjacent and new geographies that the company could consider in the future which are not currently targeted:
  - Adjacent geographies are those that are closely related to the company's existing geographies and can be served using similar capabilities or resources.
  - New geographies are those that are outside the company's current footprint but could be pursued based on market trends.
  
  You must extensively search the web to gather information about Team Wendy's global presence.
  
  ## FORMAT
  The output must be organised as a single structured table containing the following columns:
  | Type | Geography | Description | Rationale |
  
  Where:
  - Type: "Existing", "Adjacent", or "New"
  - Geography: concise name (e.g., "North America", "Western Europe", "APAC")
  - Description: what it comprises, why grouped this way, relevant notes
  - Rationale: key evidence explaining why this classification was chosen
  
  ## OUTPUT
  Create the heading "### Definitions - Geographies" and append the table below it.
  After generating the table, produce 3-4 bullet points summarizing the Key Takeaways under "#### Key Takeaways".
  Cite all sources.`,
  
      '05-existing-matrix': `## PERSONA
  Act as a senior strategy consultant. You are advising your client Team Wendy.
  
  ## TASK
  Your task is to create a comprehensive Existing Market Matrix for Team Wendy covering intersections where the client is active with current Offerings, Customer Segments and Geographies.
  
  Based on the definitions created in previous steps, prepare complete Existing Market Spaces:
  - List every possible combination of Existing Offerings × Existing Customer Segments × Existing Geographies
  - Determine whether Team Wendy is active in that intersection
  - Include only intersections that reflect existing offerings, segments and geographies
  
  You must extensively search the web to gather up-to-date information about Team Wendy and apply judgement to classify each intersection.
  
  ## FORMAT
  The output must be organised as a single structured table:
  | Offerings | Customer Segment | Geographies | Active | Rationale |
  
  Where:
  - Active: "Yes", "No", or "Don't Know"
  - Rationale: Key evidence or reasoning (one-line) explaining why it was considered active or not
  
  ## OUTPUT
  Create the heading "### Existing Market Matrix" and append the table below it.
  After generating the table, produce 3-4 bullet points summarizing the Key Takeaways under "#### Key Takeaways".
  Cite all sources.`,
  
      '06-adjacent-new-matrix': `## PERSONA
  Act as a senior strategy consultant. You are advising your client Team Wendy.
  
  ## TASK
  Your task is to identify Adjacent & New Market Spaces for Team Wendy.
  
  Based on the definitions from previous steps:
  - Enumerate only plausible combinations of Offering × Customer Segment × Geography that represent adjacent expansions or new market opportunities
  - Classify each intersection as "Adjacent" or "New" based on research and judgement
  - Consider only the offerings, segments and geographies already defined
  
  You must extensively search the web to gather up-to-date information about market trends and opportunities.
  
  ## FORMAT
  The output must be organised as a single structured table:
  | Offerings | Customer Segment | Geographies | Classification | Rationale |
  
  Where:
  - Classification: "Adjacent" or "New"
  - Rationale: Key evidence or reasoning (one-line) explaining the classification
  
  ## OUTPUT
  Create the heading "### Adjacent and New Market Matrix" and append the table below it.
  After generating the table, produce 3-4 bullet points summarizing the Key Takeaways under "#### Key Takeaways".
  Cite all sources.`,
  
      '07-synthesis': `## PERSONA
  Act as a senior strategy consultant with deep domain expertise.
  
  ## TASK
  Your task is to create a comprehensive synthesis and Q&A section for the Team Wendy market analysis.
  
  Generate the following elements:
  1. **Synthesis**: A short but comprehensive summary (approximately 100 words) covering the key findings from the market analysis
  2. **Q&A Section**: Answer ONLY these Strategic Questions:
     - What markets do we currently operate in?
     - What adjacent/new markets should we consider?
     - What is the size, growth, attractiveness and trends of those markets?
  3. **Sources**: List all sources used in bullet points
  
  Answer in a narrative format with detailed, well-structured answers. Base answers on the content already generated in this report.
  
  ## OUTPUT
  Create these headings and sections:
  - "## Synthesis"
  - "## Q&A"
  - "## Sources"
  
  Use markdown formatting.`,
  
      '08-pdf-refinement': `## PERSONA
  You are a senior strategy consultant performing PDF-based report refinement.
  
  ## TASK
  You have been provided with:
  1. An EXISTING market report for Team Wendy
  2. Team Wendy's parent company (Avon Technologies) annual report PDF content
  
  Your job is to REFINE and ENRICH the existing report by:
  
  ### Process:
  1. **Identify Relevant Data Points from Annual Report:**
     - Financial performance data (revenue, profit margins, growth rates)
     - Strategic initiatives and objectives
     - Market insights and competitive positioning
     - Geographic and segment performance data
     - Future plans and investment priorities
     - Risk factors and opportunities
  
  2. **Integrate PDF Insights:**
     - ADD new subsections with specific financial data
     - ENHANCE existing sections with concrete numbers and facts
     - INSERT relevant strategic statements from the annual report
     - CREATE tables if financial data is available
     - MAINTAIN all original content - only ADD to it
  
  3. **Source Attribution:**
     - Cite all PDF-sourced information as: [Source: Avon Technologies Annual Report 2024, p.X]
     - Distinguish between web-sourced and PDF-sourced content
  
  ## OUTPUT
  Return the COMPLETE enriched report with:
  - All original sections preserved
  - New subsections where PDF adds value (e.g., "### Financial Performance")
  - Specific numbers, dates, and facts from the PDF
  - Proper markdown formatting (##, ###, tables)
  - Clear citations for all PDF-sourced content
  
  IMPORTANT: Be SPECIFIC - use actual data from the annual report context provided. The enriched report should be noticeably more detailed and data-rich!`,
    };
  
    return prompts[promptType] || prompts['01-introduction'];
  }