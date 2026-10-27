<?php extend('layouts/backend_layout'); ?>

<?php section('content'); ?>

<div id="general-settings-page" class="container backend-page py-3">
    <div id="general-settings">
        <div class="row">
            <div class="col-sm-3">
                <?php component('settings_nav'); ?>
            </div>
            <div class="col-sm-9">
                <form>
                    <fieldset>
                        <div class="d-flex justify-content-between align-items-center border-bottom mb-4 py-2">
                            <h4 class="mb-0 fw-light">
                                <?= lang('general_settings') ?>
                            </h4>

                            <?php if (can('edit', PRIV_SYSTEM_SETTINGS)): ?>
                                <button type="button" id="save-settings" class="btn btn-primary">
                                    <i class="fas fa-check-square me-2"></i>
                                    <?= lang('save') ?>
                                </button>
                            <?php endif; ?>
                        </div>

                        <div class="row mb-5">
                            <div class="col-12">
                                <h5 class="mb-3 fw-light"><?= lang('company') ?></h5>

                                <div class="mb-3">
                                    <label class="form-label" for="company-name">
                                        <?= lang('company_name') ?>
                                        <span class="text-danger">*</span>
                                    </label>
                                    <input id="company-name" data-field="company_name" class="required form-control">
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('company_name_hint') ?>
                                        </small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="company-email">
                                        <?= lang('company_email') ?>
                                        <span class="text-danger">*</span>
                                    </label>
                                    <input id="company-email" data-field="company_email" class="required form-control">
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('company_email_hint') ?>
                                        </small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="company-link">
                                        <?= lang('company_link') ?>
                                        <span class="text-danger">*</span>
                                    </label>
                                    <input id="company-link" data-field="company_link" class="required form-control">
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('company_link_hint') ?>
                                        </small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="company-logo">
                                        <?= lang('company_logo') ?>
                                    </label>
                                    <input type="file" id="company-logo" data-field="company_logo" class="form-control"
                                           accept="image/*">
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('company_logo_hint') ?>
                                        </small>
                                    </div>

                                    <div class="d-flex justify-content-center">
                                        <img src="#" alt="Company Logo Preview" id="company-logo-preview"
                                             class="img-thumbnail my-3" hidden>
                                    </div>

                                    <div class="d-flex justify-content-center">
                                        <button type="button" class="btn btn-danger btn-sm mb-3"
                                                id="remove-company-logo" hidden>
                                            <i class="fas fa-trash me-2"></i>
                                            <?= lang('remove') ?>
                                        </button>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="company-color">
                                        <?= lang('company_color') ?>
                                    </label>

                                    <input type="color" id="company-color" data-field="company_color"
                                           class="form-control">

                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('company_color_hint') ?>
                                        </small>
                                    </div>

                                    <div class="d-flex justify-content-center">
                                        <button type="button" class="btn btn-danger btn-sm my-3"
                                                id="reset-company-color" hidden>
                                            <i class="fas fa-undo-alt me-2"></i>
                                            <?= lang('reset') ?>
                                        </button>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="theme">
                                        <?= lang('theme') ?>
                                    </label>

                                    <select id="theme" data-field="theme" class="form-select">
                                        <?php foreach (vars('available_themes') as $available_theme): ?>
                                            <option value="<?= $available_theme ?>">
                                                <?= ucfirst($available_theme) ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>

                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('company_color_hint') ?>
                                        </small>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div class="row mb-5">
                            <div class="col-12">
                                <h5 class="mb-3 fw-light"><?= lang('localization') ?></h5>

                                <div class="mb-3">
                                    <label class="form-label" for="date-format">
                                        <?= lang('date_format') ?>
                                    </label>
                                    <select class="form-select" id="date-format" data-field="date_format">
                                        <option value="DMY">DMY</option>
                                        <option value="MDY">MDY</option>
                                        <option value="YMD">YMD</option>
                                    </select>
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('date_format_hint') ?>
                                        </small>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label" for="time-format">
                                        <?= lang('time_format') ?>
                                    </label>
                                    <select class="form-select" id="time-format" data-field="time_format">
                                        <option value="<?= TIME_FORMAT_REGULAR ?>">H:MM AM/PM</option>
                                        <option value="<?= TIME_FORMAT_MILITARY ?>">HH:MM</option>
                                    </select>
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('time_format_hint') ?>
                                        </small>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label" for="first-weekday">
                                        <?= lang('first_weekday') ?>
                                    </label>
                                    <select class="form-select" id="first-weekday" data-field="first_weekday">
                                        <option value="sunday"><?= lang('sunday') ?></option>
                                        <option value="monday"><?= lang('monday') ?></option>
                                        <option value="tuesday"><?= lang('tuesday') ?></option>
                                        <option value="wednesday"><?= lang('wednesday') ?></option>
                                        <option value="thursday"><?= lang('thursday') ?></option>
                                        <option value="friday"><?= lang('friday') ?></option>
                                        <option value="saturday"><?= lang('saturday') ?></option>
                                    </select>
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('first_weekday_hint') ?>
                                        </small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="day-start-time">
                                        <?= lang('day_start_time') ?>
                                    </label>
                                    <select class="form-select" id="day-start-time" data-field="day_start_time">
                                        <?php for ($h = 0; $h < 24; $h++): ?>
                                            <?php
                                            $time_str = sprintf('%02d:00', $h);
                                            $display_label = date('g:i A', strtotime("2000-01-01 $time_str"));
                                            ?>
                                            <option value="<?= $time_str ?>"><?= $display_label ?> (<?= $time_str ?>)</option>
                                        <?php endfor; ?>
                                    </select>
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('day_start_time_hint') ?>
                                        </small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="day-end-time">
                                        <?= lang('day_end_time') ?>
                                    </label>
                                    <select class="form-select" id="day-end-time" data-field="day_end_time">
                                        <?php for ($h = 1; $h <= 24; $h++): ?>
                                            <?php
                                            $time_str = $h === 24 ? '24:00' : sprintf('%02d:00', $h);
                                            $display_label = $h === 24 ? '12:00 AM (Midnight)' : date('g:i A', strtotime("2000-01-01 $time_str"));
                                            ?>
                                            <option value="<?= $time_str ?>"><?= $display_label ?> (<?= $time_str ?>)</option>
                                        <?php endfor; ?>
                                    </select>
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('day_end_time_hint') ?>
                                        </small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="calendar-height">
                                        <?= lang('calendar_height') ?>
                                    </label>
                                    <select class="form-select" id="calendar-height" data-field="calendar_height">
                                        <option value="auto"><?= lang('calendar_height_auto') ?></option>
                                        <option value="window"><?= lang('calendar_height_window') ?></option>
                                        <option value="1000"><?= lang('calendar_height_tall') ?></option>
                                    </select>
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('calendar_height_hint') ?>
                                        </small>
                                    </div>
                                </div>

                                <div class="form-check form-switch mb-1">
                                    <input class="form-check-input" type="checkbox" id="calendar-header-show-month"
                                           data-field="calendar_header_show_month">
                                    <label class="form-check-label" for="calendar-header-show-month">
                                        <?= lang('calendar_header_show_month') ?>
                                    </label>
                                </div>
                                <div class="form-text text-muted mb-3">
                                    <small>
                                        <?= lang('calendar_header_show_month_hint') ?>
                                    </small>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="default-language">
                                        <?= lang('default_language') ?>
                                        <span class="text-danger" hidden>*</span>
                                    </label>
                                    <select id="default-language" class="form-select required"
                                            data-field="default_language">
                                        <?php foreach (vars('available_languages') as $available_language): ?>
                                            <option value="<?= $available_language ?>">
                                                <?= ucfirst($available_language) ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                    <div class="form-text text-muted">
                                        <small>
                                            <?= lang('default_language_hint') ?>
                                        </small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="default-timezone">
                                        <?= lang('default_timezone') ?>
                                        <span class="text-danger" hidden>*</span>
                                    </label>
                                    <?php component('timezone_dropdown', [
                                        'attributes' =>
                                            'id="default-timezone" data-field="default_timezone" class="form-select required"',
                                        'grouped_timezones' => vars('grouped_timezones'),
                                    ]); ?>
                                </div>
                                <div class="form-text text-muted mb-3">
                                    <small>
                                        <?= lang('default_timezone_hint') ?>
                                    </small>
                                </div>

                                <div class="form-check form-switch mb-1">
                                    <input class="form-check-input" type="checkbox" id="hide-timezone"
                                           data-field="hide_timezone">
                                    <label class="form-check-label" for="hide-timezone">
                                        <?= lang('hide_timezone') ?>
                                    </label>
                                </div>
                                <div class="form-text text-muted">
                                    <small>
                                        <?= lang('hide_timezone_hint') ?>
                                    </small>
                                </div>

                            </div>
                        </div>

                        <div class="row mb-5">
                            <div class="col-12">
                                <h5 class="mb-3 fw-light"><?= lang('calendar_colors') ?></h5>

                                <div class="mb-3">
                                    <label class="form-label" for="color-not-working">
                                        <?= lang('color_not_working') ?>
                                    </label>
                                    <input type="color" id="color-not-working" data-field="color_not_working"
                                           class="form-control form-control-color" value="#bebebe">
                                    <div class="form-text text-muted">
                                        <small><?= lang('color_not_working_hint') ?></small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="color-unavailability">
                                        <?= lang('color_unavailability') ?>
                                    </label>
                                    <input type="color" id="color-unavailability" data-field="color_unavailability"
                                           class="form-control form-control-color" value="#879db4">
                                    <div class="form-text text-muted">
                                        <small><?= lang('color_unavailability_hint') ?></small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="color-blocked-period">
                                        <?= lang('color_blocked_period') ?>
                                    </label>
                                    <input type="color" id="color-blocked-period" data-field="color_blocked_period"
                                           class="form-control form-control-color" value="#d65069">
                                    <div class="form-text text-muted">
                                        <small><?= lang('color_blocked_period_hint') ?></small>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </fieldset>
                </form>
            </div>
        </div>
    </div>
</div>

<?php end_section('content'); ?>

<?php section('scripts'); ?>

<script src="<?= asset_url('assets/js/http/general_settings_http_client.js') ?>"></script>
<script src="<?= asset_url('assets/js/pages/general_settings.js') ?>"></script>

<?php end_section('scripts'); ?>
