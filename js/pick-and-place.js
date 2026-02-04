/**
 * PickAndPlace
 * A utility to replace drag-and-drop with a 2-step "Pick" then "Place" interaction.
 * Improved for mobile usability.
 */
class PickAndPlace {
    constructor(options) {
        this.draggableSelector = options.draggableSelector || '.draggable';
        this.zoneSelector = options.zoneSelector || '.drop-zone';
        this.activeClass = options.activeClass || 'picked';
        this.disabledClass = options.disabledClass || 'correct'; // Items that can't be picked

        this.onDrop = options.onDrop || (() => { });
        this.onPick = options.onPick || (() => { });
        this.onCancel = options.onCancel || (() => { });

        this.pickedItem = null;
        this.boundHandleClick = this.handleClick.bind(this);

        this.init();
    }

    init() {
        document.addEventListener('click', this.boundHandleClick);
    }

    destroy() {
        document.removeEventListener('click', this.boundHandleClick);
        this.cancelPick();
    }

    handleClick(e) {
        const target = e.target;

        // 1. Check if clicking a drop zone (PRIORITY: If we have an item, zone click takes precedence over nested items if any)
        // Actually, if I click a zone, I want to drop.
        const zone = target.closest(this.zoneSelector);

        // 2. Check if clicking a draggable item
        const draggable = target.closest(this.draggableSelector);

        // Logic:
        // If we have a picked item:
        //   - If clicking a zone: Try to drop.
        //   - If clicking the SAME item: Cancel.
        //   - If clicking ANOTHER draggable: Switch pick.
        //   - Else: Cancel (optional, or ignore). Let's ignore to allow scrolling.

        // If we DON'T have a picked item:
        //   - If clicking draggable: Pick it.
        //   - Else: Ignore.

        if (this.pickedItem) {
            if (zone) {
                // Special case: if zone contains the clicked draggable (e.g. clicking an item already inside a zone), 
                // we might want to pick that item instead of dropping on the zone?
                // But for this game, items in zones are usually "done" or "correct".
                // Let's rely on standard logic.
                this.handleDrop(zone);
                return;
            }

            if (draggable) {
                if (draggable === this.pickedItem) {
                    this.cancelPick();
                } else if (!draggable.classList.contains(this.disabledClass)) {
                    this.pickItem(draggable);
                }
                return;
            }

            // Optional: clicking explicitly on background cancels?
            // e.g. close button behavior.
        } else {
            if (draggable && !draggable.classList.contains(this.disabledClass)) {
                this.pickItem(draggable);
            }
        }
    }

    pickItem(item) {
        if (this.pickedItem) {
            this.cancelPick(); // switch
        }

        this.pickedItem = item;
        this.pickedItem.classList.add(this.activeClass);
        document.body.classList.add('pnp-active'); // For global styling (cursor, zones highlight)
        this.onPick(this.pickedItem);
    }

    cancelPick() {
        if (this.pickedItem) {
            this.pickedItem.classList.remove(this.activeClass);
            this.onCancel(this.pickedItem);
            this.pickedItem = null;
            document.body.classList.remove('pnp-active');
        }
    }

    handleDrop(zone) {
        if (!this.pickedItem) return;

        // Execute user callback
        // Expect callback to return true if drop was successful/accepted, false otherwise.
        const result = this.onDrop(this.pickedItem, zone);

        if (result !== false) {
            // Successful drop (or at least processed)
            this.pickedItem.classList.remove(this.activeClass);
            this.pickedItem = null;
            document.body.classList.remove('pnp-active');
        }
    }
}
