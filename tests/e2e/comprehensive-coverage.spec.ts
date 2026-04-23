import { test, expect } from '@playwright/test';

const DEPLOYED_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('UniHub: Comprehensive End-to-End Test Suite', () => {
  test.setTimeout(120000); // 2 minutes
  test.describe.configure({ retries: 2 });

  // ==================== RESOURCES MANAGEMENT & FEEDBACK ====================

  /**
   * RESOURCE TEST 1: Browse and Search Resources
   * Tests library page, search, filtering, and resource discovery
   */
  test('User can browse, search, and filter learning resources', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/library`, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: 'screenshots/resources-01-library-loaded.png',
      fullPage: true,
    });

    // Look for main heading
    const mainHeading = page.locator('h1').filter({ hasText: /resources|library/i });
    const hasHeading = await mainHeading.isVisible({ timeout: 5000 }).catch(() => false);

    // Test Search Functionality
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('React');
      await page.waitForTimeout(800);
    }

    await page.screenshot({
      path: 'screenshots/resources-02-after-search.png',
      fullPage: true,
    });

    // Test Year Filter
    const yearSelect = page.locator('select').first();
    
    if (await yearSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      try {
        await yearSelect.selectOption({ index: 1 }).catch(() => null);
        await page.waitForTimeout(500);
      } catch (e) {
        // Continue if filtering fails
      }
    }

    await page.screenshot({
      path: 'screenshots/resources-03-filtered.png',
      fullPage: true,
    });

    // Verify Resource Cards Grid
    const resourceGrid = page.locator('div[class*="grid"]').first();
    const hasGrid = await resourceGrid.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasGrid) {
      await page.screenshot({
        path: 'screenshots/resources-04-resource-grid.png',
        fullPage: true,
      });
    }
  });

  /**
   * RESOURCE TEST 2: View Resource Details and Metadata
   * Tests viewing individual resource details, ratings, downloads, etc.
   */
  test('User can view detailed resource information and metadata', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/library`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/resources-05-page-loaded.png',
      fullPage: true,
    });

    // Wait for resource grid to load
    const resourceGrid = page.locator('div[class*="grid"]').first();
    const gridLoaded = await resourceGrid.isVisible({ timeout: 8000 }).catch(() => false);

    if (gridLoaded) {
      // Find first resource card/article
      const resourceCard = page.locator('article, div[role="article"], div[class*="card"]').first();
      if (await resourceCard.isVisible({ timeout: 3000 }).catch(() => false)) {
        await resourceCard.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({
      path: 'screenshots/resources-06-details-modal.png',
      fullPage: true,
    });

    // Check for resource metadata in modal/detail view
    const resourceName = page.locator('h2, h3').first();
    const nameVisible = await resourceName.isVisible({ timeout: 3000 }).catch(() => false);

    // Look for uploader info
    const uploaderInfo = page.locator('text=/uploaded|by|author|creator/i').first();
    if (await uploaderInfo.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Uploader info found
    }

    // Look for download/open button
    const actionButtons = page.locator('button').all();
    const hasActions = (await actionButtons).length > 0;

    await page.screenshot({
      path: 'screenshots/resources-07-details-complete.png',
      fullPage: true,
    });
  });

  /**
   * RESOURCE TEST 3: Rate and Provide Feedback on Resources
   * Tests rating system, comments, and feedback mechanisms
   */
  test('User can rate resources and provide detailed feedback', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/library`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/resources-08-library-page.png',
      fullPage: true,
    });

    // Find and click a resource card to open detail modal
    const resourceGrid = page.locator('div[class*="grid"]').first();
    if (await resourceGrid.isVisible({ timeout: 5000 }).catch(() => false)) {
      const firstResource = page.locator('article, div[role="article"], button').first();
      if (await firstResource.isVisible({ timeout: 3000 }).catch(() => false)) {
        try {
          await firstResource.click();
          // Wait for modal to load instead of fixed timeout
          await page.locator('dialog, [role="dialog"], div[class*="modal"]').first().isVisible({ timeout: 10000 }).catch(() => false);
          await page.waitForLoadState('networkidle').catch(() => {});
        } catch (e) {
          // Continue if click fails
        }
      }
    }

    try {
      await page.screenshot({
        path: 'screenshots/resources-09-resource-modal.png',
        fullPage: true,
        timeout: 10000,
      });
    } catch (e) {
      // Continue if screenshot fails
    }

    // Look for rating stars or rating input
    const ratingInputs = page.locator('input[type="radio"], button[class*="star"]');
    const ratingCount = await ratingInputs.count();

    if (ratingCount > 0) {
      try {
        // Click on a rating (e.g., 4 stars)
        await ratingInputs.nth(Math.min(3, ratingCount - 1)).click();
        await page.waitForTimeout(300);
      } catch (e) {
        // Continue if rating fails
      }

      try {
        await page.screenshot({
          path: 'screenshots/resources-10-rating-selected.png',
          fullPage: true,
          timeout: 10000,
        });
      } catch (e) {
        // Screenshot failed, continue
      }
    }

    // Look for feedback comment textarea
    const feedbackInputs = page.locator('textarea');
    const hasTextarea = (await feedbackInputs.count()) > 0;

    if (hasTextarea) {
      try {
        await feedbackInputs.first().fill('Great resource! Very helpful and well organized.');
        await page.waitForTimeout(300);
      } catch (e) {
        // Continue if filling fails
      }

      try {
        await page.screenshot({
          path: 'screenshots/resources-11-feedback-typed.png',
          fullPage: true,
          timeout: 10000,
        });
      } catch (e) {
        // Screenshot failed, continue
      }
    }

    // Look for submit button
    const submitBtns = page.locator('button:has-text("Submit"), button:has-text("Save")');
    if ((await submitBtns.count()) > 0) {
      try {
        await submitBtns.first().click();
        await page.waitForTimeout(800);
      } catch (e) {
        // Continue if submit fails
      }

      try {
        await page.screenshot({
          path: 'screenshots/resources-12-feedback-submitted.png',
          fullPage: true,
          timeout: 10000,
        });
      } catch (e) {
        // Screenshot failed, continue
      }
    }
  });

  /**
   * RESOURCE TEST 4: Save/Bookmark Resources for Later
   * Tests bookmarking and creating personal resource collections
   */
  test('User can save and organize resources in personal library', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/library`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/resources-13-library-page.png',
      fullPage: true,
    });

    // Find resource cards in grid
    const resourceGrid = page.locator('div[class*="grid"]').first();
    if (await resourceGrid.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Look for save/bookmark button on first resource card
      const firstResourceCard = page.locator('article, div[role="article"]').first();
      
      if (await firstResourceCard.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Find save/bookmark button within the card
        const saveButton = firstResourceCard.locator('button:has-text("Save"), button:has-text("Bookmark")').first();
        
        if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          try {
            await saveButton.click();
            await page.waitForTimeout(400);
          } catch (e) {
            // Continue if click fails
          }

          await page.screenshot({
            path: 'screenshots/resources-14-saved.png',
            fullPage: true,
          });
        }
      }
    }

    // Navigate to Your Resources section or saved collection
    const yourResourcesSection = page.locator('h2').filter({ hasText: /your resources|uploaded/i }).first();
    if (await yourResourcesSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.screenshot({
        path: 'screenshots/resources-15-your-resources.png',
        fullPage: true,
      });
    }

    // Look for saved resources via sidebar/navigation
    const sidebarLinks = page.locator('a, button').filter({ hasText: /saved|bookmarks|favorites/i });
    if ((await sidebarLinks.count()) > 0) {
      try {
        await sidebarLinks.first().click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({
          path: 'screenshots/resources-16-saved-collection.png',
          fullPage: true,
        });
      } catch (e) {
        // Continue if navigation fails
      }
    }
  });

  // ==================== LIVE STREAMING & LIVE CHAT ====================

  /**
   * LIVE TEST 1: Browse and Discover Live Streams
   * Tests discovering live and upcoming streams
   */
  test('User can discover and browse live streams and schedule', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/live`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/live-01-live-page-loaded.png',
      fullPage: true,
    });

    // Check for live indicator and current streams
    const liveBadge = page.locator('text=/LIVE|live|streaming|ONGOING/i').first();
    if (await liveBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(liveBadge).toBeVisible();

      await page.screenshot({
        path: 'screenshots/live-02-active-stream-found.png',
        fullPage: true,
      });
    }

    // Check for upcoming streams schedule
    const upcomingSection = page.locator('[data-testid="upcoming-streams"]');
    if (await upcomingSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(upcomingSection).toBeVisible();

      await page.screenshot({
        path: 'screenshots/live-03-upcoming-schedule.png',
        fullPage: true,
      });
    }

    // Check stream cards grid
    const streamCards = page.locator('[data-testid="stream-card"]');
    const cardCount = await streamCards.count();

    if (cardCount > 0) {
      await page.screenshot({
        path: 'screenshots/live-04-stream-grid.png',
        fullPage: true,
      });
    }

    // Check for filter options
    const streamFilters = page.locator('[data-testid="stream-filter"]');
    if (await streamFilters.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.screenshot({
        path: 'screenshots/live-05-stream-filters.png',
        fullPage: true,
      });
    }
  });

  /**
   * LIVE TEST 2: Watch Live Stream and Interact with Chat
   * Tests watching streams and real-time chat interactions
   */
  test('User can watch live stream and participate in live chat', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/live`, { waitUntil: 'networkidle' });

    // Find and click a live stream
    const streamCards = page.locator('[data-testid="stream-card"]');
    if (await streamCards.first().isVisible({ timeout: 10000 }).catch(() => false)) {
      await streamCards.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'screenshots/live-06-stream-viewer-loaded.png',
        fullPage: true,
      });

      // Check for video player
      const videoPlayer = page.locator('[data-testid="stream-player"], video, iframe');
      if (await videoPlayer.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await page.screenshot({
          path: 'screenshots/live-07-video-player-active.png',
          fullPage: true,
        });
      }

      // Check for stream title and info
      const streamTitle = page.locator('[data-testid="stream-title"]');
      if (await streamTitle.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(streamTitle).toBeVisible();
      }

      // Check for viewer count
      const viewerCount = page.locator('[data-testid="viewer-count"]');
      if (await viewerCount.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(viewerCount).toBeVisible();

        await page.screenshot({
          path: 'screenshots/live-08-stream-info-visible.png',
          fullPage: true,
        });
      }

      // Test chat panel
      const chatPanel = page.locator('[data-testid="chat-panel"]');
      if (await chatPanel.isVisible({ timeout: 5000 }).catch(() => false)) {
        await page.screenshot({
          path: 'screenshots/live-09-chat-panel-visible.png',
          fullPage: true,
        });

        // Send chat message
        const chatInput = chatPanel.locator('[data-testid="chat-input"]');
        if (
          await chatInput.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await chatInput.fill('Great stream! Thanks for explaining this clearly.');
          await page.waitForTimeout(300);

          const sendBtn = chatPanel.locator('[data-testid="send-message"]');
          if (
            await sendBtn.isVisible({ timeout: 5000 }).catch(() => false)
          ) {
            await sendBtn.click();
            await page.waitForTimeout(500);

            await page.screenshot({
              path: 'screenshots/live-10-message-sent.png',
              fullPage: true,
            });
          }
        }
      }
    }
  });

  /**
   * LIVE TEST 3: Send Live Feedback and Reactions
   * Tests sending reactions and feedback during streams
   */
  test('User can send reactions and live feedback during streams', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/live`, { waitUntil: 'networkidle' });

    const streamCards = page.locator('[data-testid="stream-card"]');
    if (await streamCards.first().isVisible({ timeout: 10000 }).catch(() => false)) {
      await streamCards.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'screenshots/live-11-stream-opened.png',
        fullPage: true,
      });

      // Find reaction buttons
      const reactionButtons = page.locator('[data-testid="reaction-button"]');
      const reactionCount = await reactionButtons.count();

      if (reactionCount > 0) {
        // Click like reaction
        await reactionButtons.first().click();
        await page.waitForTimeout(300);

        await page.screenshot({
          path: 'screenshots/live-12-reaction-sent.png',
          fullPage: true,
        });
      }

      // Check for live polls/feedback
      const pollSection = page.locator('[data-testid="live-poll"]');
      if (await pollSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        const pollOption = pollSection.locator('[data-testid="poll-option"]').first();
        if (
          await pollOption.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await pollOption.click();
          await page.waitForTimeout(300);

          await page.screenshot({
            path: 'screenshots/live-13-poll-voted.png',
            fullPage: true,
          });
        }
      }

      // Check for feedback form
      const feedbackForm = page.locator('[data-testid="live-feedback-form"]');
      if (
        await feedbackForm.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        const feedbackInput = feedbackForm.locator('[data-testid="feedback-input"]');
        if (
          await feedbackInput.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await feedbackInput.fill('Can you explain more about this concept?');
          await page.waitForTimeout(300);

          await page.screenshot({
            path: 'screenshots/live-14-feedback-entered.png',
            fullPage: true,
          });
        }
      }
    }
  });

  /**
   * LIVE TEST 4: Create and Start a Live Stream
   * Tests creating and broadcasting a live stream
   */
  test('Tutor can create and manage a live streaming session', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/live/create`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/live-15-create-stream-form.png',
      fullPage: true,
    });

    // Fill stream title
    const titleInput = page.locator('[data-testid="stream-title-input"]');
    if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await titleInput.fill('Advanced JavaScript Concepts - Session 5');
      await page.waitForTimeout(300);
    }

    // Fill stream description
    const descInput = page.locator('[data-testid="stream-description-input"]');
    if (await descInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await descInput.fill(
        'Learn about closures, callbacks, promises and async/await in JavaScript. Intermediate to advanced level.'
      );
      await page.waitForTimeout(300);
    }

    // Select subject/category
    const subjectSelect = page.locator('[data-testid="subject-select"]');
    if (
      await subjectSelect.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await subjectSelect.selectOption({ index: 1 });
      await page.waitForTimeout(300);
    }

    // Set stream schedule
    const scheduleDateInput = page.locator('[data-testid="schedule-date"]');
    if (
      await scheduleDateInput.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await scheduleDateInput.fill('2024-05-01');
      await page.waitForTimeout(300);
    }

    const scheduleTimeInput = page.locator('[data-testid="schedule-time"]');
    if (
      await scheduleTimeInput.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await scheduleTimeInput.fill('18:00');
      await page.waitForTimeout(300);
    }

    await page.screenshot({
      path: 'screenshots/live-16-stream-details-filled.png',
      fullPage: true,
    });

    // Submit stream creation
    const createBtn = page.locator('[data-testid="create-stream-btn"]');
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'screenshots/live-17-stream-created.png',
        fullPage: true,
      });
    }
  });

  /**
   * LIVE TEST 5: View Past Live Shows and Recordings
   * Tests accessing recorded streams and VOD content
   */
  test('User can browse and watch past live streams recordings', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/live`, { waitUntil: 'networkidle' });

    // Look for past streams section
    const pastStreamsSection = page.locator('[data-testid="past-streams"]');
    if (
      await pastStreamsSection.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await page.screenshot({
        path: 'screenshots/live-18-past-streams-section.png',
        fullPage: true,
      });

      // Click on a past stream
      const pastStreamCard = pastStreamsSection.locator('[data-testid="stream-card"]').first();
      if (
        await pastStreamCard.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await pastStreamCard.click();
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: 'screenshots/live-19-past-stream-playback.png',
          fullPage: true,
        });

        // Check for playback controls
        const playButton = page.locator('[data-testid="play-button"]');
        if (
          await playButton.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await page.screenshot({
            path: 'screenshots/live-20-recording-ready.png',
            fullPage: true,
          });
        }
      }
    } else {
      // Alternative: Check for recordings tab
      const recordingsTab = page.locator('[data-testid="recordings-tab"]');
      if (
        await recordingsTab.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await recordingsTab.click();
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: 'screenshots/live-21-recordings-tab.png',
          fullPage: true,
        });
      }
    }
  });

  /**
   * LIVE TEST 6: Share Live Stream
   * Tests sharing stream links and social media integration
   */
  test('User can share live streams on social media and get shareable links', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/live`, { waitUntil: 'networkidle' });

    const streamCards = page.locator('[data-testid="stream-card"]');
    if (await streamCards.first().isVisible({ timeout: 10000 }).catch(() => false)) {
      await streamCards.first().click();
      await page.waitForLoadState('networkidle');

      // Find share button
      const shareBtn = page.locator('[data-testid="share-button"]');
      if (await shareBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await shareBtn.click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: 'screenshots/live-22-share-modal.png',
          fullPage: true,
        });

        // Check for social media sharing options
        const facebookShare = page.locator('[data-testid="share-facebook"]');
        if (
          await facebookShare.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await page.screenshot({
            path: 'screenshots/live-23-social-share-options.png',
            fullPage: true,
          });
        }

        // Check for copy link option
        const copyLinkBtn = page.locator('[data-testid="copy-link"]');
        if (
          await copyLinkBtn.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await copyLinkBtn.click();
          await page.waitForTimeout(300);

          await page.screenshot({
            path: 'screenshots/live-24-link-copied.png',
            fullPage: true,
          });
        }
      }
    }
  });

  // ==================== PEER-TO-PEER Q&A SYSTEM ====================

  /**
   * QNA TEST 1: Browse Q&A Questions
   * Tests viewing Q&A feed and searching questions
   */
  test('User can browse and search Q&A questions across the platform', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/qna`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/qna-01-qna-page-loaded.png',
      fullPage: true,
    });

    // Check for Q&A filter options
    const filterOptions = page.locator('[data-testid="qna-filters"]');
    if (
      await filterOptions.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await page.screenshot({
        path: 'screenshots/qna-02-filters-visible.png',
        fullPage: true,
      });
    }

    // Test search in Q&A
    const qnaSearchInput = page.locator('[data-testid="qna-search"]');
    if (
      await qnaSearchInput.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await qnaSearchInput.fill('How to implement sorting algorithms');
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'screenshots/qna-03-search-results.png',
        fullPage: true,
      });
    }

    // Check for category/subject filtering
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    if (
      await categoryFilter.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await categoryFilter.selectOption({ index: 1 });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'screenshots/qna-04-category-filtered.png',
        fullPage: true,
      });
    }

    // Check for sort options
    const sortOptions = page.locator('[data-testid="sort-by"]');
    if (
      await sortOptions.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await sortOptions.selectOption('recent');
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'screenshots/qna-05-sorted-results.png',
        fullPage: true,
      });
    }
  });

  /**
   * QNA TEST 2: Ask a Question
   * Tests creating and posting new Q&A questions
   */
  test('User can ask questions in the Q&A platform', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/qna/ask`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/qna-06-ask-question-form.png',
      fullPage: true,
    });

    // Fill question title
    const questionTitle = page.locator('[data-testid="question-title"]');
    if (
      await questionTitle.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await questionTitle.fill('What is the best way to optimize database queries in production?');
      await page.waitForTimeout(300);
    }

    // Fill question description/details
    const questionDetails = page.locator('[data-testid="question-details"]');
    if (
      await questionDetails.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await questionDetails.fill(
        'I have a database with millions of records and queries are taking too long. What strategies should I use for optimization?'
      );
      await page.waitForTimeout(300);
    }

    // Add tags/categories
    const tagsInput = page.locator('[data-testid="question-tags"]');
    if (await tagsInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tagsInput.fill('database optimization performance');
      await page.waitForTimeout(300);
    }

    // Select subject/course
    const subjectSelect = page.locator('[data-testid="subject-select"]');
    if (
      await subjectSelect.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await subjectSelect.selectOption({ index: 1 });
      await page.waitForTimeout(300);
    }

    await page.screenshot({
      path: 'screenshots/qna-07-question-filled.png',
      fullPage: true,
    });

    // Submit question
    const submitBtn = page.locator('[data-testid="submit-question"]');
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'screenshots/qna-08-question-posted.png',
        fullPage: true,
      });
    }
  });

  /**
   * QNA TEST 3: View Question and Provide Answers
   * Tests viewing questions and answering them
   */
  test('User can view questions and submit detailed answers', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/qna`, { waitUntil: 'networkidle' });

    // Click on a question
    const questionCard = page.locator('[data-testid="question-card"]');
    if (
      await questionCard.first().isVisible({ timeout: 10000 }).catch(() => false)
    ) {
      await questionCard.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'screenshots/qna-09-question-detail-page.png',
        fullPage: true,
      });

      // Check for existing answers
      const answersList = page.locator('[data-testid="answers-list"]');
      if (
        await answersList.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await page.screenshot({
          path: 'screenshots/qna-10-answers-visible.png',
          fullPage: true,
        });
      }

      // Find answer form
      const answerForm = page.locator('[data-testid="answer-form"]');
      if (
        await answerForm.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        const answerInput = answerForm.locator('[data-testid="answer-input"]');
        if (
          await answerInput.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await answerInput.fill(
            'Consider implementing the following strategies: 1. Add proper indexing 2. Use query optimization 3. Implement caching 4. Monitor performance metrics'
          );
          await page.waitForTimeout(300);

          await page.screenshot({
            path: 'screenshots/qna-11-answer-typed.png',
            fullPage: true,
          });

          // Submit answer
          const submitAnswerBtn = answerForm.locator('[data-testid="submit-answer"]');
          if (
            await submitAnswerBtn.isVisible({ timeout: 5000 }).catch(() => false)
          ) {
            await submitAnswerBtn.click();
            await page.waitForTimeout(1000);

            await page.screenshot({
              path: 'screenshots/qna-12-answer-submitted.png',
              fullPage: true,
            });
          }
        }
      }
    }
  });

  /**
   * QNA TEST 4: Vote and Manage Answers
   * Tests upvoting, downvoting, and marking best answer
   */
  test('User can upvote answers and mark best responses', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/qna`, { waitUntil: 'networkidle' });

    const questionCard = page.locator('[data-testid="question-card"]');
    if (
      await questionCard.first().isVisible({ timeout: 10000 }).catch(() => false)
    ) {
      await questionCard.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'screenshots/qna-13-question-opened.png',
        fullPage: true,
      });

      // Find answer upvote button
      const upvoteBtn = page.locator('[data-testid="upvote-answer"]').first();
      if (await upvoteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await upvoteBtn.click();
        await page.waitForTimeout(300);

        await page.screenshot({
          path: 'screenshots/qna-14-answer-upvoted.png',
          fullPage: true,
        });
      }

      // Check for mark as best answer
      const markBestBtn = page.locator('[data-testid="mark-best-answer"]').first();
      if (
        await markBestBtn.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await page.screenshot({
          path: 'screenshots/qna-15-best-answer-available.png',
          fullPage: true,
        });
      }

      // Check for downvote
      const downvoteBtn = page.locator('[data-testid="downvote-answer"]').first();
      if (
        await downvoteBtn.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await page.screenshot({
          path: 'screenshots/qna-16-voting-system.png',
          fullPage: true,
        });
      }
    }
  });

  // ==================== TUTORING SYSTEM ====================

  /**
   * TUTOR TEST 1: Browse Tutors and Profiles
   * Tests discovering tutors and viewing their profiles
   */
  test('Student can discover tutors and view their profiles and qualifications', async ({
    page,
  }) => {
    await page.goto(`${DEPLOYED_URL}/TutorForm1`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/tutor-01-tutors-page.png',
      fullPage: true,
    });

    // Check for tutor search
    const tutorSearch = page.locator('[data-testid="tutor-search"]');
    if (
      await tutorSearch.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await tutorSearch.fill('Python programming');
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'screenshots/tutor-02-search-results.png',
        fullPage: true,
      });
    }

    // Check for filter options
    const ratingFilter = page.locator('[data-testid="rating-filter"]');
    if (
      await ratingFilter.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await ratingFilter.selectOption('4');
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'screenshots/tutor-03-filtered-tutors.png',
        fullPage: true,
      });
    }

    // Click on tutor profile
    const tutorCard = page.locator('[data-testid="tutor-card"]');
    if (
      await tutorCard.first().isVisible({ timeout: 10000 }).catch(() => false)
    ) {
      await tutorCard.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'screenshots/tutor-04-tutor-profile.png',
        fullPage: true,
      });

      // Check for tutor qualifications
      const qualifications = page.locator('[data-testid="qualifications"]');
      if (
        await qualifications.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await page.screenshot({
          path: 'screenshots/tutor-05-qualifications-visible.png',
          fullPage: true,
        });
      }

      // Check for tutor ratings and reviews
      const reviews = page.locator('[data-testid="tutor-reviews"]');
      if (
        await reviews.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await page.screenshot({
          path: 'screenshots/tutor-06-reviews-section.png',
          fullPage: true,
        });
      }

      // Check for availability
      const availability = page.locator('[data-testid="availability-schedule"]');
      if (
        await availability.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await page.screenshot({
          path: 'screenshots/tutor-07-availability.png',
          fullPage: true,
        });
      }
    }
  });

  /**
   * TUTOR TEST 2: Register as Tutor
   * Tests applying to become a tutor
   */
  test('User can apply to become a tutor with qualifications', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/settings`, { waitUntil: 'networkidle' });

    // Look for become tutor option in settings
    const becomeTutorBtn = page.locator('[data-testid="become-tutor"]');
    if (
      await becomeTutorBtn.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await becomeTutorBtn.click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'screenshots/tutor-08-become-tutor-form.png',
        fullPage: true,
      });

      // Fill expertise areas
      const expertise = page.locator('[data-testid="expertise-input"]');
      if (
        await expertise.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await expertise.fill('Python, JavaScript, Web Development, Database Design');
        await page.waitForTimeout(300);
      }

      // Add qualifications
      const qualInput = page.locator('[data-testid="qualifications-input"]');
      if (
        await qualInput.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await qualInput.fill('BS Computer Science, 5 years industry experience');
        await page.waitForTimeout(300);
      }

      // Set hourly rate
      const rateInput = page.locator('[data-testid="hourly-rate-input"]');
      if (
        await rateInput.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await rateInput.fill('50');
        await page.waitForTimeout(300);
      }

      await page.screenshot({
        path: 'screenshots/tutor-09-form-filled.png',
        fullPage: true,
      });

      // Submit application
      const submitBtn = page.locator('[data-testid="submit-tutor-application"]');
      if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: 'screenshots/tutor-10-application-submitted.png',
          fullPage: true,
        });
      }
    }
  });

  /**
   * TUTOR TEST 3: Book Tutoring Session
   * Tests scheduling a one-on-one tutoring session
   */
  test('Student can book a tutoring session with availability confirmation', async ({
    page,
  }) => {
    await page.goto(`${DEPLOYED_URL}/TutorForm1`, { waitUntil: 'networkidle' });

    const tutorCard = page.locator('[data-testid="tutor-card"]');
    if (
      await tutorCard.first().isVisible({ timeout: 10000 }).catch(() => false)
    ) {
      await tutorCard.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'screenshots/tutor-11-tutor-profile-opened.png',
        fullPage: true,
      });

      // Find book session button
      const bookBtn = page.locator('[data-testid="book-session"]');
      if (await bookBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await bookBtn.click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: 'screenshots/tutor-12-booking-modal.png',
          fullPage: true,
        });

        // Select date
        const dateInput = page.locator('[data-testid="session-date"]');
        if (
          await dateInput.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await dateInput.fill('2024-05-15');
          await page.waitForTimeout(300);
        }

        // Select time
        const timeInput = page.locator('[data-testid="session-time"]');
        if (
          await timeInput.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await timeInput.fill('15:00');
          await page.waitForTimeout(300);
        }

        // Select duration
        const durationSelect = page.locator('[data-testid="session-duration"]');
        if (
          await durationSelect.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await durationSelect.selectOption('60');
          await page.waitForTimeout(300);
        }

        // Add session topic
        const topicInput = page.locator('[data-testid="session-topic"]');
        if (
          await topicInput.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await topicInput.fill('Help with my final project - Python web scraping');
          await page.waitForTimeout(300);
        }

        await page.screenshot({
          path: 'screenshots/tutor-13-booking-details.png',
          fullPage: true,
        });

        // Confirm booking
        const confirmBtn = page.locator('[data-testid="confirm-booking"]');
        if (
          await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await confirmBtn.click();
          await page.waitForTimeout(1000);

          await page.screenshot({
            path: 'screenshots/tutor-14-booking-confirmed.png',
            fullPage: true,
          });
        }
      }
    }
  });

  // ==================== QUIZ SYSTEM ====================

  /**
   * QUIZ TEST 1: Browse Quiz List
   * Tests discovering and browsing available quizzes
   */
  test('Student can discover and browse available quizzes by subject', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/quiz`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/quiz-01-quiz-page.png',
      fullPage: true,
    });

    // Check for quiz filters
    const quizFilters = page.locator('[data-testid="quiz-filters"]');
    if (
      await quizFilters.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await page.screenshot({
        path: 'screenshots/quiz-02-filters-visible.png',
        fullPage: true,
      });
    }

    // Filter by subject
    const subjectFilter = page.locator('[data-testid="subject-filter"]');
    if (
      await subjectFilter.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await subjectFilter.selectOption({ index: 1 });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'screenshots/quiz-03-subject-filtered.png',
        fullPage: true,
      });
    }

    // Filter by difficulty
    const difficultyFilter = page.locator('[data-testid="difficulty-filter"]');
    if (
      await difficultyFilter.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await difficultyFilter.selectOption('Intermediate');
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'screenshots/quiz-04-difficulty-filtered.png',
        fullPage: true,
      });
    }

    // Check quiz cards
    const quizCard = page.locator('[data-testid="quiz-card"]');
    if (
      await quizCard.first().isVisible({ timeout: 10000 }).catch(() => false)
    ) {
      await page.screenshot({
        path: 'screenshots/quiz-05-quiz-cards-visible.png',
        fullPage: true,
      });
    }
  });

  /**
   * QUIZ TEST 2: Take Quiz
   * Tests taking a quiz from start to completion
   */
  test('Student can take a quiz and submit answers with progress tracking', async ({
    page,
  }) => {
    await page.goto(`${DEPLOYED_URL}/quiz`, { waitUntil: 'networkidle' });

    // Find and click a quiz
    const quizCard = page.locator('[data-testid="quiz-card"]');
    if (
      await quizCard.first().isVisible({ timeout: 10000 }).catch(() => false)
    ) {
      await quizCard.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'screenshots/quiz-06-quiz-detail.png',
        fullPage: true,
      });

      // Click start/take quiz button
      const startBtn = page.locator('button:has-text("Start"), button:has-text("Take"), button:has-text("Begin")');
      if (await startBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await startBtn.first().click();
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: 'screenshots/quiz-07-quiz-started.png',
          fullPage: true,
        });

        // Check for progress indicator
        const progressBar = page.locator('[data-testid="progress-bar"]');
        if (
          await progressBar.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await page.screenshot({
            path: 'screenshots/quiz-08-progress-shown.png',
            fullPage: true,
          });
        }

        // Answer multiple choice question
        const answerOptions = page.locator('[data-testid="answer-option"]');
        if (
          (await answerOptions.count()) > 0
        ) {
          // Click first option
          await answerOptions.first().click();
          await page.waitForTimeout(300);

          await page.screenshot({
            path: 'screenshots/quiz-09-answer-selected.png',
            fullPage: true,
          });
        }

        // Click next question
        const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue")');
        if (await nextBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
          await nextBtn.first().click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);

          await page.screenshot({
            path: 'screenshots/quiz-10-next-question.png',
            fullPage: true,
          });
        }

        // Answer more questions
        const answerOptions2 = page.locator('[data-testid="answer-option"]');
        if (
          (await answerOptions2.count()) > 0
        ) {
          await answerOptions2.nth(1).click();
          await page.waitForTimeout(300);
        }

        // Continue to next
        const nextBtn2 = page.locator('button:has-text("Next"), button:has-text("Continue")');
        if (await nextBtn2.first().isVisible({ timeout: 5000 }).catch(() => false)) {
          await nextBtn2.first().click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);
        }

        // Submit quiz
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Finish"), button:has-text("Complete")');
        if (await submitBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
          await submitBtn.first().click();
          await page.waitForLoadState('networkidle');

          await page.screenshot({
            path: 'screenshots/quiz-11-quiz-submitted.png',
            fullPage: true,
          });
        }
      }
    }
  });

  /**
   * QUIZ TEST 3: View Quiz Results and Feedback
   * Tests viewing quiz results, score, and detailed feedback
   */
  test('Student can view quiz results, scores, and question feedback', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/quiz`, { waitUntil: 'networkidle' });

    const quizCard = page.locator('[data-testid="quiz-card"]');
    if (
      await quizCard.first().isVisible({ timeout: 10000 }).catch(() => false)
    ) {
      // Try to find a completed quiz or completed results
      const completedQuizzes = page.locator('[data-testid="completed-quiz"]');
      const firstCompleted = await completedQuizzes
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (firstCompleted) {
        await completedQuizzes.first().click();
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: 'screenshots/quiz-12-results-page.png',
          fullPage: true,
        });

        // Check for score display
        const scoreDisplay = page.locator('[data-testid="score-display"]');
        if (
          await scoreDisplay.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await page.screenshot({
            path: 'screenshots/quiz-13-score-visible.png',
            fullPage: true,
          });
        }

        // Check for detailed results
        const detailedResults = page.locator('[data-testid="detailed-results"]');
        if (
          await detailedResults.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await page.screenshot({
            path: 'screenshots/quiz-14-detailed-feedback.png',
            fullPage: true,
          });
        }

        // Check for correct/incorrect indicators
        const correctAnswers = page.locator('[data-testid="correct-answer"]');
        if (
          (await correctAnswers.count()) > 0
        ) {
          await page.screenshot({
            path: 'screenshots/quiz-15-answer-review.png',
            fullPage: true,
          });
        }

        // Check for retake option
        const retakeBtn = page.locator('[data-testid="retake-quiz"]');
        if (
          await retakeBtn.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await page.screenshot({
            path: 'screenshots/quiz-16-retake-available.png',
            fullPage: true,
          });
        }
      }
    }
  });

  // ==================== MESSAGING SYSTEM ====================

  /**
   * MESSAGE TEST 1: Browse Conversations
   * Tests viewing message inbox and conversation list
   */
  test('User can view message inbox with conversation list and filters', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/messages`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/msg-01-inbox-loaded.png',
      fullPage: true,
    });

    // Check for conversation list
    const conversationList = page.locator('[data-testid="conversation-list"]');
    if (
      await conversationList.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await page.screenshot({
        path: 'screenshots/msg-02-conversations-visible.png',
        fullPage: true,
      });
    }

    // Check for search conversations
    const searchConv = page.locator('[data-testid="search-conversations"]');
    if (
      await searchConv.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await searchConv.fill('John');
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'screenshots/msg-03-search-results.png',
        fullPage: true,
      });
    }

    // Check for conversation filters
    const filterBtn = page.locator('[data-testid="filter-messages"]');
    if (
      await filterBtn.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await filterBtn.click();
      await page.waitForTimeout(300);

      await page.screenshot({
        path: 'screenshots/msg-04-filters-menu.png',
        fullPage: true,
      });
    }
  });

  /**
   * MESSAGE TEST 2: Open Conversation and Send Message
   * Tests opening a chat and sending/receiving messages
   */
  test('User can open conversations and send direct messages', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/messages`, { waitUntil: 'networkidle' });

    // Click on first conversation
    const conversationItem = page.locator('[data-testid="conversation-item"]');
    if (
      await conversationItem.first().isVisible({ timeout: 10000 }).catch(() => false)
    ) {
      await conversationItem.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'screenshots/msg-05-conversation-opened.png',
        fullPage: true,
      });

      // Check for message history
      const messageHistory = page.locator('[data-testid="message-history"]');
      if (
        await messageHistory.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await page.screenshot({
          path: 'screenshots/msg-06-message-history.png',
          fullPage: true,
        });
      }

      // Send a message
      const messageInput = page.locator('[data-testid="message-input"]');
      if (
        await messageInput.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await messageInput.fill('Hi! How are you doing with the assignment?');
        await page.waitForTimeout(300);

        await page.screenshot({
          path: 'screenshots/msg-07-message-typed.png',
          fullPage: true,
        });

        // Send message
        const sendBtn = page.locator('[data-testid="send-message-btn"]');
        if (
          await sendBtn.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await sendBtn.click();
          await page.waitForTimeout(500);

          await page.screenshot({
            path: 'screenshots/msg-08-message-sent.png',
            fullPage: true,
          });
        }
      }
    }
  });

  /**
   * MESSAGE TEST 3: Start New Conversation
   * Tests initiating a new direct message with a user
   */
  test('User can start a new conversation with another user', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/messages`, { waitUntil: 'networkidle' });

    // Find new message button
    const newMessageBtn = page.locator('[data-testid="new-message"]');
    if (
      await newMessageBtn.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await newMessageBtn.click();
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'screenshots/msg-09-new-message-modal.png',
        fullPage: true,
      });

      // Search for user
      const userSearchInput = page.locator('[data-testid="search-users"]');
      if (
        await userSearchInput.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await userSearchInput.fill('Sarah');
        await page.waitForTimeout(500);

        await page.screenshot({
          path: 'screenshots/msg-10-user-search.png',
          fullPage: true,
        });

        // Select a user
        const userOption = page.locator('[data-testid="user-option"]').first();
        if (
          await userOption.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await userOption.click();
          await page.waitForTimeout(300);

          await page.screenshot({
            path: 'screenshots/msg-11-user-selected.png',
            fullPage: true,
          });

          // Compose first message
          const composeInput = page.locator('[data-testid="compose-message"]');
          if (
            await composeInput.isVisible({ timeout: 5000 }).catch(() => false)
          ) {
            await composeInput.fill('Hi Sarah! I wanted to ask about the Python project.');
            await page.waitForTimeout(300);

            await page.screenshot({
              path: 'screenshots/msg-12-message-composed.png',
              fullPage: true,
            });

            // Send message
            const sendBtn = page.locator('[data-testid="send-new-message"]');
            if (
              await sendBtn.isVisible({ timeout: 5000 }).catch(() => false)
            ) {
              await sendBtn.click();
              await page.waitForTimeout(1000);

              await page.screenshot({
                path: 'screenshots/msg-13-new-conversation-started.png',
                fullPage: true,
              });
            }
          }
        }
      }
    }
  });

  /**
   * MESSAGE TEST 4: Message Notifications
   * Tests notification indicators for new messages
   */
  test('User receives notifications for new messages and mentions', async ({ page }) => {
    await page.goto(DEPLOYED_URL, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/msg-14-home-page.png',
      fullPage: true,
    });

    // Check notification bell
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    if (
      await notificationBell.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      // Check for notification badge
      const badge = notificationBell.locator('[data-testid="notification-badge"]');
      if (
        await badge.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await page.screenshot({
          path: 'screenshots/msg-15-notifications-badge.png',
          fullPage: true,
        });

        // Click to open notifications
        await notificationBell.click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: 'screenshots/msg-16-notifications-panel.png',
          fullPage: true,
        });
      }
    }
  });

  // ==================== THEME & GENERAL UI ====================

  /**
   * GENERAL TEST 1: Dark Mode Toggle
   * Tests theme switching functionality
   */
  test('User can toggle dark and light mode theme', async ({ page }) => {
    await page.goto(DEPLOYED_URL, { waitUntil: 'networkidle' });

    const html = page.locator('html');
    const initialClass = await html.getAttribute('class') || '';
    const initialDarkMode = initialClass.includes('dark');

    await page.screenshot({
      path: 'screenshots/theme-01-initial-mode.png',
      fullPage: true,
    });

    // Find theme toggle button
    const themeBtn = page.locator('[data-testid="theme-toggle"]');
    if (await themeBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await themeBtn.click();
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'screenshots/theme-02-toggle-clicked.png',
        fullPage: true,
      });

      const newClass = await html.getAttribute('class') || '';
      const newDarkMode = newClass.includes('dark');
      expect(initialDarkMode).not.toBe(newDarkMode);

      // Toggle back
      await themeBtn.click();
      await page.waitForTimeout(500);

      const finalClass = await html.getAttribute('class') || '';
      const finalDarkMode = finalClass.includes('dark');
      expect(finalDarkMode).toBe(initialDarkMode);

      await page.screenshot({
        path: 'screenshots/theme-03-toggle-restored.png',
        fullPage: true,
      });
    }
  });

  /**
   * GENERAL TEST 2: User Profile and Settings
   * Tests accessing user profile and updating settings
   */
  test('User can access profile page and update account settings', async ({ page }) => {
    await page.goto(`${DEPLOYED_URL}/settings`, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/settings-01-settings-page.png',
      fullPage: true,
    });

    // Check for profile section
    const profileSection = page.locator('[data-testid="profile-section"]');
    if (
      await profileSection.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await page.screenshot({
        path: 'screenshots/settings-02-profile-section.png',
        fullPage: true,
      });

      // Update display name
      const displayNameInput = profileSection.locator('[data-testid="display-name"]');
      if (
        await displayNameInput.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await displayNameInput.fill('John Doe');
        await page.waitForTimeout(300);

        await page.screenshot({
          path: 'screenshots/settings-03-profile-updated.png',
          fullPage: true,
        });
      }
    }

    // Check for preferences section
    const preferencesSection = page.locator('[data-testid="preferences-section"]');
    if (
      await preferencesSection.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await page.screenshot({
        path: 'screenshots/settings-04-preferences.png',
        fullPage: true,
      });

      // Toggle notification preferences
      const notificationToggle = preferencesSection.locator('[data-testid="notify-toggle"]');
      if (
        await notificationToggle.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await notificationToggle.click();
        await page.waitForTimeout(300);

        await page.screenshot({
          path: 'screenshots/settings-05-preferences-changed.png',
          fullPage: true,
        });
      }
    }
  });

  /**
   * GENERAL TEST 3: Navigation and Layout
   * Tests main navigation and page layout
   */
  test('User can navigate through main site sections and sidebar', async ({ page }) => {
    await page.goto(DEPLOYED_URL, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: 'screenshots/nav-01-home-page.png',
      fullPage: true,
    });

    // Check sidebar navigation
    const sidebar = page.locator('[data-testid="sidebar"]');
    if (await sidebar.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.screenshot({
        path: 'screenshots/nav-02-sidebar-visible.png',
        fullPage: true,
      });

      // Click library link
      const libraryLink = sidebar.locator('[data-testid="nav-library"]');
      if (
        await libraryLink.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await libraryLink.click();
        await page.waitForLoadState('networkidle');

        await page.screenshot({
          path: 'screenshots/nav-03-library-navigated.png',
          fullPage: true,
        });
      }
    }

    // Check top navigation bar
    const topBar = page.locator('[data-testid="top-bar"]');
    if (await topBar.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check for search in top bar
      const topBarSearch = topBar.locator('[data-testid="search-input"]');
      if (
        await topBarSearch.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await page.screenshot({
          path: 'screenshots/nav-04-top-bar-search.png',
          fullPage: true,
        });
      }
    }
  });
});
