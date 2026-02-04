/**
 * Samovar - SRS System Tests
 * Comprehensive test suite for Spaced Repetition System
 */

class SRSTests {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.tests = [];
    }

    assert(condition, message) {
        if (condition) {
            this.passed++;
            console.log(`✅ PASS: ${message}`);
            this.tests.push({ status: 'pass', message });
        } else {
            this.failed++;
            console.error(`❌ FAIL: ${message}`);
            this.tests.push({ status: 'fail', message });
        }
    }

    assertEqual(actual, expected, message) {
        this.assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
    }

    assertGreaterThan(actual, threshold, message) {
        this.assert(actual > threshold, `${message} (expected > ${threshold}, got: ${actual})`);
    }

    assertLessThan(actual, threshold, message) {
        this.assert(actual < threshold, `${message} (expected < ${threshold}, got: ${actual})`);
    }

    // ============================================
    // SM-2 ALGORITHM TESTS
    // ============================================

    testSM2Algorithm() {
        console.log('\n=== Testing SM-2 Algorithm ===\n');

        // Test 1: Initial learning (quality 4)
        let result = SM2Algorithm.calculate(4, 0, 2.5, 0);
        this.assertEqual(result.repetitions, 1, 'First repetition should be 1');
        this.assertEqual(result.interval, 1, 'First interval should be 1 day');
        this.assertGreaterThan(result.easiness, 2.4, 'Easiness should increase slightly');

        // Test 2: Second repetition (quality 4)
        result = SM2Algorithm.calculate(4, 1, result.easiness, 1);
        this.assertEqual(result.repetitions, 2, 'Second repetition should be 2');
        this.assertEqual(result.interval, 6, 'Second interval should be 6 days');

        // Test 3: Third repetition (quality 4)
        result = SM2Algorithm.calculate(4, 2, result.easiness, 6);
        this.assertEqual(result.repetitions, 3, 'Third repetition should be 3');
        this.assertGreaterThan(result.interval, 6, 'Third interval should be > 6 days');

        // Test 4: Failed recall (quality 2)
        result = SM2Algorithm.calculate(2, 3, 2.5, 15);
        this.assertEqual(result.repetitions, 0, 'Failed recall should reset repetitions');
        this.assertEqual(result.interval, 1, 'Failed recall should reset interval to 1');
        this.assertLessThan(result.easiness, 2.5, 'Failed recall should decrease easiness');

        // Test 5: Easiness floor (quality 0)
        result = SM2Algorithm.calculate(0, 0, 1.3, 0);
        this.assertGreaterThan(result.easiness, 1.29, 'Easiness should not go below 1.3');

        // Test 6: Easy recall (quality 5)
        result = SM2Algorithm.calculate(5, 2, 2.5, 6);
        this.assertGreaterThan(result.easiness, 2.5, 'Easy recall should increase easiness');
        this.assertGreaterThan(result.interval, 15, 'Easy recall should give longer interval');

        // Test 7: Priority calculation for new cards
        const newCard = {
            repetitions: 0,
            lastReview: null,
            interval: 0,
            easiness: 2.5
        };
        const priority = SM2Algorithm.calculatePriority(newCard);
        this.assertEqual(priority, 1000, 'New cards should have highest priority');

        // Test 8: Priority calculation for overdue cards
        const overdueCard = {
            repetitions: 2,
            lastReview: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
            interval: 5, // Should have been reviewed 5 days ago
            easiness: 2.5
        };
        const overduePriority = SM2Algorithm.calculatePriority(overdueCard);
        this.assertGreaterThan(overduePriority, 100, 'Overdue cards should have high priority');
    }

    // ============================================
    // VOCAB CARD TESTS
    // ============================================

    testVocabCard() {
        console.log('\n=== Testing VocabCard ===\n');

        // Test 1: Card creation
        const card = new VocabCard({
            russian: 'Привет',
            danish: 'Hej',
            transcription: 'privʲet',
            lessonId: '01-intro'
        });

        this.assert(card.id !== undefined, 'Card should have an ID');
        this.assertEqual(card.russian, 'Привет', 'Card should store russian word');
        this.assertEqual(card.danish, 'Hej', 'Card should store danish translation');
        this.assertEqual(card.repetitions, 0, 'New card should have 0 repetitions');
        this.assertEqual(card.easiness, 2.5, 'New card should have default easiness 2.5');

        // Test 2: Card review (success)
        card.review(4);
        this.assertEqual(card.repetitions, 1, 'After review, repetitions should be 1');
        this.assertEqual(card.totalReviews, 1, 'Total reviews should be 1');
        this.assertEqual(card.correctReviews, 1, 'Correct reviews should be 1');
        this.assert(card.lastReview !== null, 'Last review should be set');
        this.assert(card.nextReview > Date.now(), 'Next review should be in future');

        // Test 3: Card review (failure)
        card.review(2);
        this.assertEqual(card.repetitions, 0, 'Failed review should reset repetitions');
        this.assertEqual(card.totalReviews, 2, 'Total reviews should be 2');
        this.assertEqual(card.correctReviews, 1, 'Correct reviews should still be 1');

        // Test 4: isDue check
        const dueCard = new VocabCard({
            russian: 'Test',
            danish: 'Test',
            nextReview: Date.now() - 1000
        });
        this.assert(dueCard.isDue(), 'Card with past nextReview should be due');

        const notDueCard = new VocabCard({
            russian: 'Test',
            danish: 'Test',
            nextReview: Date.now() + 100000
        });
        this.assert(!notDueCard.isDue(), 'Card with future nextReview should not be due');

        // Test 5: Accuracy calculation
        const accuracyCard = new VocabCard({ russian: 'Test', danish: 'Test' });
        accuracyCard.totalReviews = 10;
        accuracyCard.correctReviews = 8;
        this.assertEqual(accuracyCard.getAccuracy(), 80, 'Accuracy should be 80%');

        // Test 6: Status
        this.assertEqual(card.getStatus(), 'learning', 'Card with 0 reps but reviewed should be learning');
        
        const newCard = new VocabCard({ russian: 'New', danish: 'New' });
        this.assertEqual(newCard.getStatus(), 'new', 'Unreviewed card should be new');

        const masteredCard = new VocabCard({ russian: 'Master', danish: 'Master' });
        masteredCard.repetitions = 3;
        this.assertEqual(masteredCard.getStatus(), 'reviewing', 'Card with 3+ reps should be reviewing');
    }

    // ============================================
    // SRS MANAGER TESTS
    // ============================================

    testSRSManager() {
        console.log('\n=== Testing SRSManager ===\n');

        // Create fresh manager for testing
        const manager = new SRSManager();
        manager.storageKey = 'test_srs_' + Date.now(); // Use unique key for testing

        // Test 1: Add card
        const card1 = manager.addCard({
            russian: 'Привет',
            danish: 'Hej',
            transcription: 'privʲet',
            lessonId: '01-intro'
        });
        this.assert(card1 !== null, 'Should add card successfully');
        this.assertEqual(manager.cards.size, 1, 'Manager should have 1 card');

        // Test 2: Duplicate prevention
        const duplicate = manager.addCard({
            russian: 'Привет',
            danish: 'Hej'
        });
        this.assertEqual(manager.cards.size, 1, 'Should not add duplicate card');

        // Test 3: Find card
        const found = manager.findCardByRussian('Привет');
        this.assert(found !== undefined, 'Should find card by russian word');
        this.assertEqual(found.danish, 'Hej', 'Found card should have correct translation');

        // Test 4: Add multiple cards
        const cards = manager.addCards([
            { russian: 'Пока', danish: 'Farvel', lessonId: '01-intro' },
            { russian: 'Спасибо', danish: 'Tak', lessonId: '01-intro' },
            { russian: 'Да', danish: 'Ja', lessonId: '01-intro' }
        ]);
        this.assertEqual(cards.length, 3, 'Should add 3 cards');
        this.assertEqual(manager.cards.size, 4, 'Manager should have 4 cards total');

        // Test 5: Get cards by lesson
        const lessonCards = manager.getCardsByLesson('01-intro');
        this.assertEqual(lessonCards.length, 4, 'Should get 4 cards from lesson 01-intro');

        // Test 6: Get new cards
        const newCards = manager.getNewCards();
        this.assertEqual(newCards.length, 4, 'All cards should be new');

        // Test 7: Review card
        const result = manager.reviewCard(card1.id, 4);
        this.assert(result !== null, 'Should review card successfully');
        this.assertEqual(result.card.repetitions, 1, 'Card should have 1 repetition after review');

        // Test 8: Get due cards
        const dueCards = manager.getDueCards();
        this.assertGreaterThan(dueCards.length, 0, 'Should have due cards');

        // Test 9: Statistics
        const stats = manager.getStats();
        this.assertEqual(stats.total, 4, 'Stats should show 4 total cards');
        this.assertEqual(stats.new, 3, 'Stats should show 3 new cards');
        this.assertGreaterThan(stats.totalReviews, 0, 'Stats should show reviews');

        // Test 10: Daily stats
        this.assertEqual(stats.dailyStats.reviews, 1, 'Daily stats should show 1 review');
        this.assertEqual(stats.dailyStats.correctReviews, 1, 'Daily stats should show 1 correct review');

        // Test 11: Save and load
        manager.save();
        const manager2 = new SRSManager();
        manager2.storageKey = manager.storageKey;
        manager2.load();
        this.assertEqual(manager2.cards.size, 4, 'Loaded manager should have 4 cards');

        // Test 12: Reset card
        const resetCard = manager.resetCard(card1.id);
        this.assertEqual(resetCard.repetitions, 0, 'Reset card should have 0 repetitions');
        this.assertEqual(resetCard.totalReviews, 0, 'Reset card should have 0 total reviews');

        // Test 13: Delete card
        const deleted = manager.deleteCard(card1.id);
        this.assert(deleted, 'Should delete card successfully');
        this.assertEqual(manager.cards.size, 3, 'Manager should have 3 cards after deletion');

        // Test 14: Import from lesson
        const imported = manager.importFromLesson('02-alphabet', [
            { russian: 'А', danish: 'A', transcription: 'a' },
            { russian: 'Б', danish: 'B', transcription: 'b' }
        ]);
        this.assertEqual(imported.length, 2, 'Should import 2 cards');
        this.assertEqual(manager.cards.size, 5, 'Manager should have 5 cards after import');

        // Test 15: Get cards by tag
        manager.addCard({ russian: 'Test', danish: 'Test', tags: ['greeting', 'formal'] });
        const taggedCards = manager.getCardsByTag('greeting');
        this.assertGreaterThan(taggedCards.length, 0, 'Should find cards by tag');

        // Test 16: Export/Import
        const exportData = manager.exportData();
        this.assert(exportData.cards !== undefined, 'Export should contain cards');
        this.assert(exportData.stats !== undefined, 'Export should contain stats');

        const manager3 = new SRSManager();
        manager3.storageKey = 'test_import_' + Date.now();
        const imported2 = manager3.importData(exportData);
        this.assert(imported2, 'Should import data successfully');
        this.assertEqual(manager3.cards.size, manager.cards.size, 'Imported manager should have same number of cards');

        // Cleanup
        localStorage.removeItem(manager.storageKey);
        localStorage.removeItem(manager2.storageKey);
        localStorage.removeItem(manager3.storageKey);
    }

    // ============================================
    // INTEGRATION TESTS
    // ============================================

    testIntegration() {
        console.log('\n=== Testing Integration Scenarios ===\n');

        const manager = new SRSManager();
        manager.storageKey = 'test_integration_' + Date.now();

        // Scenario 1: Complete learning cycle
        const card = manager.addCard({
            russian: 'Привет',
            danish: 'Hej',
            transcription: 'privʲet'
        });

        // First review (quality 4)
        manager.reviewCard(card.id, 4);
        let updatedCard = manager.getCard(card.id);
        this.assertEqual(updatedCard.repetitions, 1, 'After first review: 1 repetition');
        this.assertEqual(updatedCard.interval, 1, 'After first review: 1 day interval');

        // Second review (quality 4)
        manager.reviewCard(card.id, 4);
        updatedCard = manager.getCard(card.id);
        this.assertEqual(updatedCard.repetitions, 2, 'After second review: 2 repetitions');
        this.assertEqual(updatedCard.interval, 6, 'After second review: 6 days interval');

        // Third review (quality 5 - easy)
        manager.reviewCard(card.id, 5);
        updatedCard = manager.getCard(card.id);
        this.assertEqual(updatedCard.repetitions, 3, 'After third review: 3 repetitions');
        this.assertGreaterThan(updatedCard.interval, 6, 'After third review: interval > 6 days');
        this.assertGreaterThan(updatedCard.easiness, 2.5, 'Easy review should increase easiness');

        // Failed review (quality 2)
        manager.reviewCard(card.id, 2);
        updatedCard = manager.getCard(card.id);
        this.assertEqual(updatedCard.repetitions, 0, 'After failed review: 0 repetitions');
        this.assertEqual(updatedCard.interval, 1, 'After failed review: 1 day interval');

        // Scenario 2: Queue management
        manager.addCards([
            { russian: 'Один', danish: 'En' },
            { russian: 'Два', danish: 'To' },
            { russian: 'Три', danish: 'Tre' }
        ]);

        const queue = manager.getReviewQueue(true);
        this.assertGreaterThan(queue.length, 0, 'Queue should contain cards');

        // Scenario 3: Daily limits
        const stats = manager.getStats();
        const initialNewCards = stats.dailyStats.newCards;
        
        manager.settings.newCardsPerDay = 2;
        const limitedNew = manager.getNewCards();
        this.assertLessThan(limitedNew.length, 3, 'Should respect daily new card limit');

        // Cleanup
        localStorage.removeItem(manager.storageKey);
    }

    // ============================================
    // PERFORMANCE TESTS
    // ============================================

    testPerformance() {
        console.log('\n=== Testing Performance ===\n');

        const manager = new SRSManager();
        manager.storageKey = 'test_performance_' + Date.now();

        // Test 1: Bulk card addition
        const startAdd = performance.now();
        const cards = [];
        for (let i = 0; i < 1000; i++) {
            cards.push({
                russian: `Слово${i}`,
                danish: `Ord${i}`,
                transcription: `word${i}`
            });
        }
        manager.addCards(cards);
        const endAdd = performance.now();
        const addTime = endAdd - startAdd;
        this.assertLessThan(addTime, 1000, `Should add 1000 cards in < 1s (took ${addTime.toFixed(2)}ms)`);

        // Test 2: Queue generation
        const startQueue = performance.now();
        const queue = manager.getReviewQueue(true);
        const endQueue = performance.now();
        const queueTime = endQueue - startQueue;
        this.assertLessThan(queueTime, 100, `Should generate queue in < 100ms (took ${queueTime.toFixed(2)}ms)`);

        // Test 3: Card lookup
        const startLookup = performance.now();
        for (let i = 0; i < 100; i++) {
            manager.findCardByRussian(`Слово${i}`);
        }
        const endLookup = performance.now();
        const lookupTime = endLookup - startLookup;
        this.assertLessThan(lookupTime, 100, `Should lookup 100 cards in < 100ms (took ${lookupTime.toFixed(2)}ms)`);

        // Test 4: Save/Load performance
        const startSave = performance.now();
        manager.save();
        const endSave = performance.now();
        const saveTime = endSave - startSave;
        this.assertLessThan(saveTime, 500, `Should save 1000 cards in < 500ms (took ${saveTime.toFixed(2)}ms)`);

        const startLoad = performance.now();
        manager.load();
        const endLoad = performance.now();
        const loadTime = endLoad - startLoad;
        this.assertLessThan(loadTime, 500, `Should load 1000 cards in < 500ms (took ${loadTime.toFixed(2)}ms)`);

        // Cleanup
        localStorage.removeItem(manager.storageKey);
    }

    // ============================================
    // RUN ALL TESTS
    // ============================================

    runAll() {
        console.log('🧪 Starting SRS Test Suite...\n');
        const startTime = performance.now();

        this.testSM2Algorithm();
        this.testVocabCard();
        this.testSRSManager();
        this.testIntegration();
        this.testPerformance();

        const endTime = performance.now();
        const totalTime = (endTime - startTime).toFixed(2);

        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST RESULTS');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`⏱️  Total time: ${totalTime}ms`);
        console.log(`📈 Success rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));

        return {
            passed: this.passed,
            failed: this.failed,
            totalTime: totalTime,
            tests: this.tests
        };
    }
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
    window.SRSTests = SRSTests;
    
    // Add convenience function
    window.runSRSTests = function() {
        const tests = new SRSTests();
        return tests.runAll();
    };
    
    console.log('💡 SRS Tests loaded. Run tests with: runSRSTests()');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SRSTests;
}
