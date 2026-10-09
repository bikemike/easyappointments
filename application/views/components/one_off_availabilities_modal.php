<?php
/**
 * Local variables.
 *
 * @var array $timezones
 * @var string $timezone
 */
?>

<div id="one-off-availabilities-modal" class="modal fade">
    <div class="modal-dialog modal-dialog-centered modal-fullscreen-lg-down">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title"><?= lang('new_one_off_availability_title') ?></h3>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="modal-message alert d-none"></div>

                <form>
                    <fieldset>
                        <input id="one-off-availability-id" type="hidden">

                        <div class="mb-3">
                            <label for="one-off-availability-provider" class="form-label">
                                <?= lang('provider') ?>
                            </label>
                            <select id="one-off-availability-provider" class="form-select"></select>
                        </div>

                        <div class="mb-3">
                            <label for="one-off-availability-start" class="form-label">
                                <?= lang('start') ?>
                                <span class="text-danger">*</span>
                            </label>
                            <input id="one-off-availability-start" class="form-control">
                        </div>

                        <div class="mb-3">
                            <label for="one-off-availability-end" class="form-label">
                                <?= lang('end') ?>
                                <span class="text-danger">*</span>
                            </label>
                            <input id="one-off-availability-end" class="form-control">
                        </div>

                        <?php if (!vars('hide_timezone')): ?>
                        <div class="mb-3">
                            <label class="form-label">
                                <?= lang('timezone') ?>
                            </label>

                            <div
                                class="border rounded d-flex justify-content-between align-items-center bg-light timezone-info">
                                <div class="border-end w-50 p-1 text-center">
                                    <small>
                                        <?= lang('provider') ?>:
                                        <span class="provider-timezone">
                                            -
                                        </span>
                                    </small>
                                </div>
                                <div class="w-50 p-1 text-center">
                                    <small>
                                        <?= lang('current_user') ?>:
                                        <span>
                                            <?= $timezones[session('timezone', 'UTC')] ?>
                                        </span>
                                    </small>
                                </div>
                            </div>
                        </div>
                        <?php endif; ?>

                        <div class="mb-3">
                            <label for="one-off-availability-notes" class="form-label">
                                <?= lang('notes') ?>
                            </label>
                            <textarea id="one-off-availability-notes" rows="3" class="form-control"></textarea>
                        </div>

                    </fieldset>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    <?= lang('cancel') ?>
                </button>
                <button id="save-one-off-availability" class="btn btn-success">
                    <i class="fas fa-check-square me-2"></i>
                    <?= lang('save') ?>
                </button>
            </div>
        </div>
    </div>
</div>

<?php section('scripts'); ?>

<script src="<?= asset_url('assets/js/components/one_off_availabilities_modal.js') ?>"></script>

<?php end_section('scripts'); ?>
