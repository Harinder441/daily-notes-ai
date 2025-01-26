import { Client } from '@notionhq/client';

class NotionService {
  constructor() {
    this.notion = null;
  }

  initialize(apiKey) {
    this.notion = new Client({
      auth: apiKey,
    });
  }

  async appendToPage(pageId, notes) {
    if (!this.notion) {
      throw new Error('Notion client not initialized. Please call initialize() first.');
    }

    try {
      // Group notes by month for better organization
      const monthGroups = this.groupNotesByMonth(notes);

      for (const [month, monthNotes] of Object.entries(monthGroups)) {
        // Create a month heading
        await this.notion.blocks.children.append({
          block_id: pageId,
          children: [
            {
              heading_2: {
                rich_text: [
                  {
                    text: {
                      content: month,
                    },
                  },
                ],
              },
            },
            ...monthNotes.map(note => ({
              paragraph: {
                rich_text: [
                  {
                    text: {
                      content: `${new Date(note.note_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}:\n${note.content}`,
                    },
                  },
                ],
              },
            })),
            // Add a divider after each month's notes
            {
              divider: {},
            },
          ],
        });

        // Notion API has rate limits, so we add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return true;
    } catch (error) {
      console.error('Error appending to Notion page:', error);
      throw error;
    }
  }

  groupNotesByMonth(notes) {
    const groups = {};
    
    notes.forEach(note => {
      const date = new Date(note.note_date);
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }

      groups[monthKey].push(note);
    });

    return groups;
  }

  async validatePageAccess(pageId) {
    if (!this.notion) {
      throw new Error('Notion client not initialized. Please call initialize() first.');
    }

    try {
      // Try to retrieve the page to verify access
      await this.notion.pages.retrieve({ page_id: pageId });
      return true;
    } catch (error) {
      console.error('Error validating Notion page access:', error);
      return false;
    }
  }

  async getPageTitle(pageId) {
    if (!this.notion) {
      throw new Error('Notion client not initialized. Please call initialize() first.');
    }

    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });
      return page.properties?.title?.title[0]?.plain_text || 'Untitled';
    } catch (error) {
      console.error('Error getting page title:', error);
      throw error;
    }
  }
}

export const notionService = new NotionService(); 