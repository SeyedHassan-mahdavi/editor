<?php
/*
Plugin Name: WP Eita
Description: Send WordPress posts to Eita messenger automatically.
Version: 1.1
Author: Your Name
*/

// افزودن صفحه تنظیمات مدیر
add_action('admin_menu', 'wp_eita_add_options_page');

function wp_eita_add_options_page() {
    add_menu_page('تنظیمات WP Eita', 'WP Eita', 'manage_options', 'wp_eita_settings', 'wp_eita_render_options_page');
    add_submenu_page('wp_eita_settings', 'تنظیمات', 'تنظیمات', 'manage_options', 'wp_eita_settings', 'wp_eita_render_options_page');
    add_submenu_page('wp_eita_settings', 'آمار', 'آمار', 'manage_options', 'wp_eita_stats', 'wp_eita_render_stats_page');
    add_submenu_page('wp_eita_settings', 'ارسال دستی', 'ارسال دستی', 'manage_options', 'wp_eita_manual_send', 'wp_eita_render_manual_send_page');
    add_submenu_page('wp_eita_settings', 'تنظیمات پروکسی', 'تنظیمات پروکسی', 'manage_options', 'wp_eita_proxy_settings', 'wp_eita_render_proxy_settings_page');
}

// نمایش صفحه تنظیمات پروکسی
function wp_eita_render_proxy_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    // رسیدگی به ارسال فرم
    if (isset($_POST['wp_eita_proxy_submit'])) {
        update_option('wp_eita_proxy_enabled', isset($_POST['wp_eita_proxy_enabled']) ? 1 : 0);
        update_option('wp_eita_proxy_url', sanitize_text_field($_POST['wp_eita_proxy_url']));

        ?>
        <div class="notice notice-success is-dismissible">
            <p><?php _e('تنظیمات پروکسی ذخیره شد.', 'wp-eita'); ?></p>
        </div>
        <?php
    }

    $proxy_enabled = get_option('wp_eita_proxy_enabled', 0);
    $proxy_url = get_option('wp_eita_proxy_url', '');
    ?>

    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form method="post" action="">
            <h2>تنظیمات پروکسی</h2>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="wp_eita_proxy_enabled">فعال کردن پروکسی</label></th>
                    <td><input type="checkbox" id="wp_eita_proxy_enabled" name="wp_eita_proxy_enabled" value="1" <?php checked($proxy_enabled, 1); ?>></td>
                </tr>
                <tr>
                    <th scope="row"><label for="wp_eita_proxy_url">آدرس پروکسی</label></th>
                    <td><input type="text" id="wp_eita_proxy_url" name="wp_eita_proxy_url" value="<?php echo esc_attr($proxy_url); ?>" class="regular-text"></td>
                </tr>
            </table>
            <p class="submit"><input type="submit" name="wp_eita_proxy_submit" id="wp_eita_proxy_submit" class="button button-primary" value="ذخیره تغییرات"></p>
        </form>
    </div>
    <?php
}

// بارگذاری رسانه، اسکریپت‌های Select2 و استایل‌های سفارشی
add_action('admin_enqueue_scripts', 'wp_eita_enqueue_media_uploader');

function wp_eita_enqueue_media_uploader() {
    wp_enqueue_media();
    wp_enqueue_script('wp_eita_media_uploader', plugin_dir_url(__FILE__) . 'media-uploader.js', array('jquery'), null, true);
    wp_enqueue_style('select2-css', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css');
    wp_enqueue_script('select2-js', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js', array('jquery'), null, true);
    wp_enqueue_script('wp_eita_custom_js', plugin_dir_url(__FILE__) . 'custom.js', array('jquery', 'select2-js'), null, true);
    wp_enqueue_style('wp_eita_custom_css', plugin_dir_url(__FILE__) . 'custom.css');
    wp_enqueue_style('datatables-css', 'https://cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css');
    wp_enqueue_script('datatables-js', 'https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js', array('jquery'), null, true);
    wp_enqueue_script('wp_eita_datatables_custom', plugin_dir_url(__FILE__) . 'datatables-custom.js', array('jquery', 'datatables-js'), null, true);
}

// نمایش صفحه ارسال دستی
function wp_eita_render_manual_send_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    // رسیدگی به ارسال فرم
    if (isset($_POST['wp_eita_manual_send_submit'])) {
        $title = sanitize_text_field($_POST['message_title']);
        $content = sanitize_textarea_field($_POST['message_content']);
        $channel_keys = array_map('sanitize_text_field', $_POST['message_channels']);
        $file_id = sanitize_text_field($_POST['message_file_id']);
        $message_id = isset($_POST['message_id']) ? intval($_POST['message_id']) : null;

        // ذخیره پیام در پایگاه داده
        $messages = get_option('wp_eita_messages', array());

        if ($message_id !== null) {
            // ویرایش پیام موجود
            $messages[$message_id] = array(
                'title' => $title,
                'content' => $content,
                'channel_keys' => $channel_keys,
                'file_id' => $file_id,
                'timestamp' => current_time('mysql'),
            );
        } else {
            // افزودن پیام جدید
            $messages[] = array(
                'title' => $title,
                'content' => $content,
                'channel_keys' => $channel_keys,
                'file_id' => $file_id,
                'timestamp' => current_time('mysql'),
            );
        }

        update_option('wp_eita_messages', $messages);

        // ارسال پیام به کانال‌ها
        foreach ($channel_keys as $channel_key) {
            wp_eita_send_message($title, $content, $channel_key, $file_id, $message_id);
        }
    }

    $messages = get_option('wp_eita_messages', array());
    $channels = get_option('wp_eita_channels', array());
    $edit_message = null;

    if (isset($_GET['edit_message'])) {
        $edit_message_id = intval($_GET['edit_message']);
        if (isset($messages[$edit_message_id])) {
            $edit_message = $messages[$edit_message_id];
        }
    }

    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form method="post">
            <input type="hidden" name="message_id" value="<?php echo isset($edit_message) ? esc_attr($edit_message_id) : ''; ?>">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="message_title">عنوان پیام</label></th>
                    <td><input type="text" id="message_title" name="message_title" class="regular-text" value="<?php echo isset($edit_message) ? esc_attr($edit_message['title']) : ''; ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="message_content">محتوای پیام</label></th>
                    <td><textarea id="message_content" name="message_content" class="large-text"><?php echo isset($edit_message) ? esc_textarea($edit_message['content']) : ''; ?></textarea></td>
                </tr>
                <tr>
                    <th scope="row"><label for="message_channels">کانال‌ها</label></th>
                    <td>
                        <input type="checkbox" id="select_all_channels"> انتخاب همه کانال‌ها<br>
                        <select id="message_channels" name="message_channels[]" multiple>
                            <?php foreach ($channels as $key => $channel): ?>
                                <option value="<?php echo esc_attr($key); ?>" <?php echo isset($edit_message) && in_array($key, $edit_message['channel_keys']) ? 'selected' : ''; ?>><?php echo esc_html($channel['channel_name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="message_file">بارگذاری فایل</label></th>
                    <td>
                        <button type="button" id="upload_image_button" class="button">بارگذاری/انتخاب فایل</button>
                        <input type="hidden" id="message_file_id" name="message_file_id" value="<?php echo isset($edit_message) ? esc_attr($edit_message['file_id']) : ''; ?>">
                        <div id="file_preview">
                            <?php if (isset($edit_message) && $edit_message['file_id']) {
                                echo '<a href="' . esc_url(wp_get_attachment_url($edit_message['file_id'])) . '">مشاهده فایل</a>';
                            } ?>
                        </div>
                    </td>
                </tr>
            </table>
            <p class="submit">
                <input type="submit" name="wp_eita_manual_send_submit" id="wp_eita_manual_send_submit" class="button button-primary" value="<?php echo isset($edit_message) ? 'به‌روزرسانی پیام' : 'ارسال پیام'; ?>">
                <?php if (isset($edit_message)): ?>
                    <a href="<?php echo remove_query_arg('edit_message'); ?>" class="button wp-eita-cancel-button">لغو</a>
                <?php endif; ?>
            </p>
        </form>

        <h2>پیام‌های ارسال‌شده</h2>
        <table class="wp-eita-messages-table widefat fixed" cellspacing="0">
            <thead>
                <tr>
                    <th><?php _e('عنوان', 'wp-eita'); ?></th>
                    <th><?php _e('محتوا', 'wp-eita'); ?></th>
                    <th><?php _e('کانال‌ها', 'wp-eita'); ?></th>
                    <th><?php _e('فایل', 'wp-eita'); ?></th>
                    <th><?php _e('زمان', 'wp-eita'); ?></th>
                    <th><?php _e('عملیات', 'wp-eita'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($messages as $i => $message): ?>
                    <tr>
                        <td><?php echo esc_html($message['title']); ?></td>
                        <td><?php echo esc_html($message['content']); ?></td>
                        <td>
                            <?php
                            foreach ($message['channel_keys'] as $channel_key) {
                                echo esc_html($channels[$channel_key]['channel_name']) . '<br>';
                            }
                            ?>
                        </td>
                        <td><?php if ($message['file_id']) echo '<a href="' . esc_url(wp_get_attachment_url($message['file_id'])) . '">مشاهده فایل</a>'; ?></td>
                        <td><?php echo esc_html($message['timestamp']); ?></td>
                        <td>
                            <a href="<?php echo add_query_arg('edit_message', $i); ?>" class="button wp-eita-edit-button">ویرایش</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php
}

// ثبت مسیرهای REST API برای Aparat
add_action('rest_api_init', function () {
    register_rest_route('wp-eita/v1', '/aparat-uploadform', array(
        'methods' => 'GET',
        'callback' => 'wp_eita_aparat_uploadform',
        'permission_callback' => '__return_true',
    ));
});

function wp_eita_aparat_uploadform(WP_REST_Request $request) {
    $luser = $request->get_param('luser');
    $ltoken = $request->get_param('ltoken');

    // URL API
    $url = "https://www.aparat.com/etc/api/uploadform/luser/{$luser}/ltoken/{$ltoken}";

    // انجام درخواست به API Aparat
    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return new WP_REST_Response('اتصال به API Aparat شکست خورد', 500);
    }

    $body = wp_remote_retrieve_body($response);
    return new WP_REST_Response(json_decode($body), wp_remote_retrieve_response_code($response));
}

// تابع برای ارسال پیام به پلتفرم
function wp_eita_send_message($title, $content, $channel_key, $file_id = '', $message_id = null) {
    $channels = get_option('wp_eita_channels', array());
    if (!isset($channels[$channel_key])) {
        echo "کلید کانال یافت نشد: $channel_key<br>";
        return;
    }

    $channel = $channels[$channel_key];
    $bot_token = $channel['bot_token'];
    $chat_id = $channel['chat_id'];
    $parse_mode = $channel['parse_mode'];
    $platform = $channel['platform'];
    $proxy_enabled = get_option('wp_eita_proxy_enabled', 0);
    $proxy_url = get_option('wp_eita_proxy_url', '');

    echo "پلتفرم: $platform<br>";
    echo "شناسه چت: $chat_id<br>";
    echo "توکن ربات: $bot_token<br>";

    if ($platform === 'eita') {
        $post_fields = array(
            'chat_id' => $chat_id,
            'caption' => $content,
            'parse_mode' => $parse_mode
        );
        if ($file_id) {
            $file_path = get_attached_file($file_id);
            if (file_exists($file_path)) {
                $post_fields['file'] = new CURLFile($file_path);
                $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendFile');
            } else {
                echo "فایل یافت نشد: $file_id<br>";
                return;
            }
        } else {
            $post_fields['text'] = $content;
            $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendMessage');
        }
        curl_setopt($request, CURLOPT_POST, true);
        curl_setopt($request, CURLOPT_POSTFIELDS, $post_fields);
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($request);
        echo "پاسخ Eita: $response<br>";
        curl_close($request);
    } elseif ($platform === 'bale') {
        $message_id = get_post_meta($post_ID, '_bale_message_id', true);
$file_id = $_POST['file_id']; // گرفتن file_id به صورت دستی

if ($message_id) {
    // چک کنیم که آیا پیام قبلی حاوی عکس بوده است یا خیر
    $file_id = get_post_meta($post_ID, '_bale_file_id', true);

    // پیام قبلی دارای عکس بوده، ولی ما هنوز هم متن را ویرایش می‌کنیم
    $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/editMessageText');
    curl_setopt($request, CURLOPT_POST, true);
    curl_setopt($request, CURLOPT_POSTFIELDS, array(
        'chat_id' => $chat_id,
        'message_id' => $message_id,
        'text' => $content,
        'parse_mode' => $parse_mode
    ));
    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($request);
    $result = json_decode($response, true);
    echo "Bale response: $response<br>";
    echo "Formatted Message Sent: " . $content . "<br>";
    curl_close($request);

    if (isset($result['error_code']) && $result['error_code'] == 403) {
        echo "Error: Permission denied. Please check bot permissions and chat access.<br>";
    }
} else {
    if ($send_image && $file_id) {
        $file_path = get_attached_file($file_id);

        if (file_exists($file_path)) {
            if ($combine_text_image) {
                // ارسال عکس با کپشن
                $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendPhoto');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'photo' => new CURLFile($file_path),
                    'caption' => $content,
                    'chat_id' => $chat_id,
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                $result = json_decode($response, true);
                echo "Bale response: $response<br>";
                echo "Formatted Message Sent with Photo: " . $content . "<br>";
                curl_close($request);

                if (isset($result['result']['message_id'])) {
                    update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
                    update_post_meta($post_ID, '_bale_file_id', $result['result']['photo'][0]['file_id']);
                }
            } else {
                // ارسال عکس
                $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendPhoto');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'photo' => new CURLFile($file_path),
                    'chat_id' => $chat_id,
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                $result = json_decode($response, true);
                echo "Bale response: $response<br>";
                echo "Formatted Message Sent: " . $content . "<br>";
                curl_close($request);

                if (isset($result['result']['message_id'])) {
                    update_post_meta($post_ID, '_bale_file_id', $result['result']['photo'][0]['file_id']);
                }

                // ارسال متن
                $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendMessage');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'text' => $content,
                    'chat_id' => $chat_id,
                    'parse_mode' => $parse_mode
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                $result = json_decode($response, true);
                echo "Bale response: $response<br>";
                echo "Formatted Message Sent: " . $content . "<br>";
                curl_close($request);

                if (isset($result['result']['message_id'])) {
                    update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
                }
            }
        } else {
            echo "File not found: $file_id<br>";
        }
    } else {
        // ارسال فقط متن
        $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendMessage');
        curl_setopt($request, CURLOPT_POST, true);
        curl_setopt($request, CURLOPT_POSTFIELDS, array(
            'text' => $content,
            'chat_id' => $chat_id,
            'parse_mode' => $parse_mode
        ));
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($request);
        $result = json_decode($response, true);
        echo "Bale response: $response<br>";
        curl_close($request);

        if (isset($result['result']['message_id'])) {
            update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
        }
    }
}

    } elseif ($platform === 'telegram') {
        if (!$proxy_enabled) {
            echo "پروکسی غیرفعال است. پیام تلگرام ارسال نشد.<br>";
            return;
        }

        $post_fields = array(
            'chat_id' => $chat_id,
            'caption' => $content,
            'parse_mode' => $parse_mode
        );

        $url = '';

        if ($file_id) {
            $file_path = get_attached_file($file_id);
            if (file_exists($file_path)) {
                $file_type = mime_content_type($file_path);
                switch ($file_type) {
                    case 'image/jpeg':
                    case 'image/png':
                        $url = 'https://api.telegram.org/bot' . $bot_token . '/sendPhoto';
                        $post_fields['photo'] = new CURLFile($file_path);
                        break;
                    case 'video/mp4':
                        $url = 'https://api.telegram.org/bot' . $bot_token . '/sendVideo';
                        $post_fields['video'] = new CURLFile($file_path);
                        break;
                    case 'audio/mpeg':
                    case 'audio/mp4':
                        $url = 'https://api.telegram.org/bot' . $bot_token . '/sendAudio';
                        $post_fields['audio'] = new CURLFile($file_path);
                        break;
                    case 'application/pdf':
                    case 'application/zip':
                        $url = 'https://api.telegram.org/bot' . $bot_token . '/sendDocument';
                        $post_fields['document'] = new CURLFile($file_path);
                        break;
                    default:
                        echo "نوع فایل پشتیبانی نمی‌شود: $file_type<br>";
                        return;
                }
            } else {
                echo "فایل یافت نشد: $file_id<br>";
                return;
            }
        } else {
            $url = 'https://api.telegram.org/bot' . $bot_token . '/sendMessage';
            $post_fields['text'] = $content;
        }

        // ارسال پیام از طریق cURL
        $request = curl_init($url);
        curl_setopt($request, CURLOPT_POST, true);
        curl_setopt($request, CURLOPT_POSTFIELDS, $post_fields);
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($request);
        echo "پاسخ Telegram: $response<br>";
        curl_close($request);
    }
}

// بارگذاری اسکریپت‌ها
function wp_eita_enqueue_scripts($hook) {
    if ($hook != 'settings_page_wp-eita-options') {
        return;
    }
    // بارگذاری jQuery به عنوان وابستگی
    wp_enqueue_script('jquery');
}
add_action('admin_enqueue_scripts', 'wp_eita_enqueue_scripts');

 // ثبت مسیرهای REST API برای ورود به Aparat
add_action('rest_api_init', function () {
    register_rest_route('wp-eita/v1', '/aparat-login', array(
        'methods' => 'POST',
        'callback' => 'wp_eita_aparat_login',
        'permission_callback' => '__return_true',
    ));
});

function wp_eita_aparat_login(WP_REST_Request $request) {
    $username = $request->get_param('username');
    $password = $request->get_param('password');

    // هش کردن رمز عبور
    $hashed_password = sha1(md5($password));

    // URL API
    $url = "https://www.aparat.com/etc/api/login/luser/{$username}/lpass/{$hashed_password}";

    // انجام درخواست به API Aparat
    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return new WP_REST_Response('اتصال به API Aparat شکست خورد', 500);
    }

    $body = wp_remote_retrieve_body($response);
    return new WP_REST_Response(json_decode($body), wp_remote_retrieve_response_code($response));
}

// نمایش صفحه تنظیمات
function wp_eita_render_options_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    if (isset($_POST['wp_eita_submit'])) {
        $channels = array();
        if (isset($_POST['wp_eita_channels'])) {
            foreach ($_POST['wp_eita_channels'] as $channel) {
                if (!empty($channel['bot_token']) && !empty($channel['chat_id']) && !empty($channel['platform']) && !empty($channel['channel_name'])) {
                    $channels[] = array(
                        'channel_name' => sanitize_text_field($channel['channel_name']),
                        'bot_token' => sanitize_text_field($channel['bot_token']),
                        'chat_id' => sanitize_text_field($channel['chat_id']),
                        'max_character_limit' => intval($channel['max_character_limit']),
                        'parse_mode' => sanitize_text_field($channel['parse_mode']),
                        'message_format' => sanitize_textarea_field($channel['message_format']),
                        'platform' => sanitize_text_field($channel['platform']),
                        'send_woocommerce' => isset($channel['send_woocommerce']) ? sanitize_text_field($channel['send_woocommerce']) : '',
                        'woocommerce_message_format' => sanitize_textarea_field($channel['woocommerce_message_format']),
                        'active' => isset($channel['active']) ? (bool) $channel['active'] : false,
                        'send_image' => isset($channel['send_image']) ? (bool) $channel['send_image'] : false,
                        'combine_text_image' => isset($channel['combine_text_image']) ? (bool) $channel['combine_text_image'] : false,
                        'image_position' => sanitize_text_field($channel['image_position']),
                        'summary_source' => sanitize_text_field($channel['summary_source']),
                        'enable_link_button' => isset($channel['enable_link_button']) ? (bool) $channel['enable_link_button'] : false,
                        'button_text' => sanitize_text_field($channel['button_text']),
                        'button_url' => sanitize_text_field($channel['button_url']),
                    );
                }
            }
        }
        update_option('wp_eita_channels', $channels);
        ?>
        <div class="notice notice-success is-dismissible">
            <p><?php _e('تنظیمات ذخیره شد.', 'wp-eita'); ?></p>
        </div>
        <?php
    }

    $channels = get_option('wp_eita_channels', array(
        array(
            'channel_name' => '',
            'bot_token' => '',
            'chat_id' => '',
            'max_character_limit' => 55,
            'parse_mode' => 'markdown',
            'message_format' => '[post_title]' . "\n" . '[post_content]' . "\n" . '[post_url]',
            'platform' => 'eita',
            'send_woocommerce' => '',
            'woocommerce_message_format' => '[product_name]' . "\n" . '[product_price]' . "\n" . '[product_url]' . "\n" . '[product_description]',
            'active' => true,
            'send_image' => false,
            'combine_text_image' => false,
            'image_position' => 'after',
            'summary_source' => 'full',
            'enable_link_button' => false,
            'button_text' => '',
            'button_url' => '',
        ),
    ));
    ?>

    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        
        <!-- فرم دریافت توکن Aparat -->
        <div class="aparat-container">
            <h2 id="aparat-toggle">دریافت توکن Aparat</h2>
            <form id="aparat-login-form" class="aparat-form" style="display: none;">
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="aparat_username">نام کاربری</label></th>
                        <td><input type="text" id="aparat_username" name="aparat_username" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="aparat_password">رمز عبور</label></th>
                        <td><input type="password" id="aparat_password" name="aparat_password" class="regular-text"></td>
                    </tr>
                    <tr id="token-row" style="display: none;">
                        <th scope="row"><label for="aparat_token">توکن</label></th>
                        <td><input type="text" id="aparat_token" class="small-text" readonly></td>
                    </tr>
                </table>
                <p class="submit"><button type="button" id="aparat-login-button" class="button button-primary">دریافت توکن Aparat</button></p>
            </form>
        </div>

        <!-- فرم کانال‌های موجود -->
        <form method="post" action="">
            <div id="wp-eita-channels-accordion">
                <?php foreach ($channels as $i => $channel): ?>
                    <div class="wp-eita-channel">
                        <h3 class="wp-eita-channel-header">
                            <div>
                                <span>کانال <?php echo $i + 1; ?></span>
                                <span class="toggle-icon">^</span>
                            </div>
                            <button type="button" class="button wp-eita-remove-channel" data-index="<?php echo $i; ?>">حذف کانال</button>
                        </h3>
                        <div class="wp-eita-channel-content">
                            <table class="form-table wp-eita-settings-table">
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_active">فعال</label></th>
                                    <td><input type="checkbox" id="wp_eita_channels_<?php echo $i; ?>_active" name="wp_eita_channels[<?php echo $i; ?>][active]" value="1" <?php checked($channel['active'], true); ?>></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_channel_name">نام کانال</label></th>
                                    <td><input type="text" id="wp_eita_channels_<?php echo $i; ?>_channel_name" name="wp_eita_channels[<?php echo $i; ?>][channel_name]" value="<?php echo esc_attr($channel['channel_name']); ?>" class="regular-text"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_platform">پلتفرم</label></th>
                                    <td>
                                        <select id="wp_eita_channels_<?php echo $i; ?>_platform" name="wp_eita_channels[<?php echo $i; ?>][platform]">
                                            <option value="eita" <?php selected($channel['platform'], 'eita'); ?>>Eita</option>
                                            <option value="bale" <?php selected($channel['platform'], 'bale'); ?>>Bale</option>
                                            <option value="telegram" <?php selected($channel['platform'], 'telegram'); ?>>Telegram</option>
                                            <option value="aparat" <?php selected($channel['platform'], 'aparat'); ?>>Aparat</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_bot_token">توکن ربات</label></th>
                                    <td><input type="text" id="wp_eita_channels_<?php echo $i; ?>_bot_token" name="wp_eita_channels[<?php echo $i; ?>][bot_token]" value="<?php echo esc_attr($channel['bot_token']); ?>" class="regular-text"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_chat_id">شناسه چت</label></th>
                                    <td><input type="text" id="wp_eita_channels_<?php echo $i; ?>_chat_id" name="wp_eita_channels[<?php echo $i; ?>][chat_id]" value="<?php echo esc_attr($channel['chat_id']); ?>" class="regular-text"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_max_character_limit">حداکثر کاراکتر برای پیام</label></th>
                                    <td><input type="number" id="wp_eita_channels_<?php echo $i; ?>_max_character_limit" name="wp_eita_channels[<?php echo $i; ?>][max_character_limit]" value="<?php echo esc_attr($channel['max_character_limit']); ?>" class="small-text"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_parse_mode">حالت تجزیه</label></th>
                                    <td>
                                        <select id="wp_eita_channels_<?php echo $i; ?>_parse_mode" name="wp_eita_channels[<?php echo $i; ?>][parse_mode]">
                                            <option value="markdown" <?php selected($channel['parse_mode'], 'markdown'); ?>>Markdown</option>
                                            <option value="html" <?php selected($channel['parse_mode'], 'html'); ?>>HTML</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_message_format">فرمت پیام</label></th>
                                    <td><textarea id="wp_eita_channels_<?php echo $i; ?>_message_format" name="wp_eita_channels[<?php echo $i; ?>][message_format]" class="large-text"><?php echo esc_textarea($channel['message_format']); ?></textarea></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_send_woocommerce">فعال کردن یکپارچه‌سازی WooCommerce</label></th>
                                    <td>
                                        <select id="wp_eita_channels_<?php echo $i; ?>_send_woocommerce" name="wp_eita_channels[<?php echo $i; ?>][send_woocommerce]">
                                            <option value="" <?php selected($channel['send_woocommerce'], ''); ?>>هیچ‌کدام</option>
                                            <option value="products" <?php selected($channel['send_woocommerce'], 'products'); ?>>ارسال محصولات جدید</option>
                                            <option value="orders" <?php selected($channel['send_woocommerce'], 'orders'); ?>>ارسال سفارش‌های جدید</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_woocommerce_message_format">فرمت پیام WooCommerce</label></th>
                                    <td>
                                        <textarea id="wp_eita_channels_<?php echo $i; ?>_woocommerce_message_format" name="wp_eita_channels[<?php echo $i; ?>][woocommerce_message_format]" class="large-text"><?php echo esc_textarea($channel['woocommerce_message_format']); ?></textarea>
                                        <p class="description">
                                            از جایگزین‌های زیر در فرمت پیام خود استفاده کنید:<br>
                                            <code>[product_name]</code> - نام محصول<br>
                                            <code>[product_price]</code> - قیمت محصول<br>
                                            <code>[product_url]</code> - لینک به محصول<br>
                                            <code>[product_description]</code> - توضیحات محصول<br>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_send_image">ارسال عکس</label></th>
                                    <td><input type="checkbox" id="wp_eita_channels_<?php echo $i; ?>_send_image" name="wp_eita_channels[<?php echo $i; ?>][send_image]" value="1" <?php checked($channel['send_image'], true); ?>></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_combine_text_image">ترکیب متن و عکس در یک پیام</label></th>
                                    <td><input type="checkbox" id="wp_eita_channels_<?php echo $i; ?>_combine_text_image" name="wp_eita_channels[<?php echo $i; ?>][combine_text_image]" value="1" <?php checked($channel['combine_text_image'], true); ?>></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_image_position">موقعیت عکس</label></th>
                                    <td>
                                        <select id="wp_eita_channels_<?php echo $i; ?>_image_position" name="wp_eita_channels[<?php echo $i; ?>][image_position]">
                                            <option value="before" <?php selected($channel['image_position'], 'before'); ?>>قبل از متن</option>
                                            <option value="after" <?php selected($channel['image_position'], 'after'); ?>>بعد از متن</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_summary_source">منبع خلاصه مطلب</label></th>
                                    <td>
                                        <select id="wp_eita_channels_<?php echo $i; ?>_summary_source" name="wp_eita_channels[<?php echo $i; ?>][summary_source]">
                                            <option value="full" <?php selected($channel['summary_source'], 'full'); ?>>متن کامل</option>
                                            <option value="excerpt" <?php selected($channel['summary_source'], 'excerpt'); ?>>خلاصه خبر</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_enable_link_button">فعال کردن دکمه لینک</label></th>
                                    <td><input type="checkbox" id="wp_eita_channels_<?php echo $i; ?>_enable_link_button" name="wp_eita_channels[<?php echo $i; ?>][enable_link_button]" value="1" <?php checked($channel['enable_link_button'], true); ?>></td>
                                </tr>
                                <tr class="link-button-settings" style="<?php echo $channel['enable_link_button'] ? '' : 'display: none;'; ?>">
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_button_text">متن دکمه</label></th>
                                    <td><input type="text" id="wp_eita_channels_<?php echo $i; ?>_button_text" name="wp_eita_channels[<?php echo $i; ?>][button_text]" value="<?php echo esc_attr($channel['button_text']); ?>" class="regular-text"></td>
                                </tr>
                                <tr class="link-button-settings" style="<?php echo $channel['enable_link_button'] ? '' : 'display: none;'; ?>">
                                    <th scope="row"><label for="wp_eita_channels_<?php echo $i; ?>_button_url">آدرس دکمه</label></th>
                                    <td><input type="text" id="wp_eita_channels_<?php echo $i; ?>_button_url" name="wp_eita_channels[<?php echo $i; ?>][button_url]" value="<?php echo esc_attr($channel['button_url']); ?>" class="regular-text"></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            <p><button type="button" id="add-channel" class="button button-secondary">+ افزودن کانال</button></p>
            <p class="submit"><input type="submit" name="wp_eita_submit" id="wp_eita_submit" class="button button-primary" value="ذخیره تغییرات"></p>
        </form>
    </div>

    <style>
        .wp-eita-settings-table {
            width: 100% !important;
            border-collapse: collapse !important;
            background-color: #fff !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
            margin-bottom: 20px !important;
        }
        .wp-eita-settings-table th,
        .wp-eita-settings-table td {
            padding: 15px !important;
            border-bottom: 1px solid #eee !important;
        }
        .wp-eita-settings-table th {
            text-align: left !important;
            background-color: #f7f7f7 !important;
            color: #333 !important;
            font-weight: bold !important;
        }
        .wp-eita-settings-table .regular-text,
        .wp-eita-settings-table .small-text,
        .wp-eita-settings-table .large-text {
            padding: 10px !important;
            border-radius: 4px !important;
            border: 1px solid #ddd !important;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }
        .wp-eita-settings-table .regular-text {
            width: 100% !important;
            max-width: 500px !important;
        }
        .wp-eita-settings-table .small-text {
            width: 150px !important;
        }
        .wp-eita-settings-table .large-text {
            width: 100% !important;
            height: 100px !important;
        }
        .button {
            padding: 10px 20px !important;
            font-size: 1em !important;
            border-radius: 5px !important;
            transition: background-color 0.3s !important;
        }
        .button-primary {
            background-color: #0073aa !important;
            border-color: #0073aa !important;
            color: #fff !important;
        }
        .button-primary:hover {
            background-color: #005a8e !important;
            border-color: #005a8e !important;
        }
        .button-secondary {
            background-color: #f7f7f7 !important;
            border-color: #ccc !important;
            color: #555 !important;
        }
        .button-secondary:hover {
            background-color: #e7e7e7 !important;
            border-color: #bbb !important;
        }
        .submit {
            text-align: right !important;
            padding: 20px 0 !important;
        }
        .description {
            font-style: italic !important;
            color: #555 !important;
            margin-top: 10px !important;
        }
        .aparat-form {
            padding: 20px;
            border-top: 1px solid #ccc;
            display: none;
        }
        .aparat-form input[type="text"],
        .aparat-form input[type="password"],
        .aparat-form .button {
            margin-bottom: 15px;
            width: 100%;
        }
        #aparat_token {
            height: 50px !important;
            font-size: 1.2em !important;
            background-color: #f0f0f0 !important;
            border-color: #0073aa !important;
            color: #333 !important;
        }
        .small-text {
            width: 100%;
            height: 40px;
        }
        #wp-eita-channels-accordion {
            margin-top: 20px;
        }
        .wp-eita-channel-header {
            background-color: #0073aa;
            color: #fff;
            padding: 10px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .wp-eita-channel-header:hover {
            background-color: #005a8e;
        }
        .wp-eita-channel-content {
            display: none;
            padding: 10px;
            background-color: #f7f7f7;
            border: 1px solid #ddd;
            border-top: none;
        }
        .wp-eita-channel-header .dashicons {
            font-size: 20px;
        }
        .toggle-icon {
            font-size: 20px;
            margin-left: 10px;
        }
    </style>

    <script>
        jQuery(document).ready(function($) {
            let channelCount = <?php echo count($channels); ?>;
            const maxChannels = 5;

            function updateChannelNumbers() {
                $('#wp-eita-channels-accordion .wp-eita-channel').each(function(index) {
                    $(this).find('.wp-eita-channel-header span').first().text('کانال ' + (index + 1));
                    $(this).find('.wp-eita-remove-channel').attr('data-index', index);
                });
            }

            $('#add-channel').click(function() {
                if (channelCount >= maxChannels) {
                    alert('شما می‌توانید حداکثر ' + maxChannels + ' کانال اضافه کنید.');
                    return;
                }
                
                const channelIndex = channelCount;
                channelCount++;

                const channelHtml = `
                    <div class="wp-eita-channel">
                        <h3 class="wp-eita-channel-header">
                            <div>
                                <span>کانال ${channelIndex + 1}</span>
                                <span class="toggle-icon">^</span>
                            </div>
                            <button type="button" class="button wp-eita-remove-channel" data-index="${channelIndex}">حذف کانال</button>
                        </h3>
                        <div class="wp-eita-channel-content">
                            <table class="form-table wp-eita-settings-table">
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_active">فعال</label></th>
                                    <td><input type="checkbox" id="wp_eita_channels_${channelIndex}_active" name="wp_eita_channels[${channelIndex}][active]" value="1"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_channel_name">نام کانال</label></th>
                                    <td><input type="text" id="wp_eita_channels_${channelIndex}_channel_name" name="wp_eita_channels[${channelIndex}][channel_name]" class="regular-text"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_platform">پلتفرم</label></th>
                                    <td>
                                        <select id="wp_eita_channels_${channelIndex}_platform" name="wp_eita_channels[${channelIndex}][platform]">
                                            <option value="eita">Eita</option>
                                            <option value="bale">Bale</option>
                                            <option value="telegram">Telegram</option>
                                            <option value="aparat">Aparat</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_bot_token">توکن ربات</label></th>
                                    <td><input type="text" id="wp_eita_channels_${channelIndex}_bot_token" name="wp_eita_channels[${channelIndex}][bot_token]" class="regular-text"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_chat_id">شناسه چت</label></th>
                                    <td><input type="text" id="wp_eita_channels_${channelIndex}_chat_id" name="wp_eita_channels[${channelIndex}][chat_id]" class="regular-text"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_max_character_limit">حداکثر کاراکتر برای پیام</label></th>
                                    <td><input type="number" id="wp_eita_channels_${channelIndex}_max_character_limit" name="wp_eita_channels[${channelIndex}][max_character_limit]" class="small-text"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_parse_mode">حالت تجزیه</label></th>
                                    <td>
                                        <select id="wp_eita_channels_${channelIndex}_parse_mode" name="wp_eita_channels[${channelIndex}][parse_mode]">
                                            <option value="markdown">Markdown</option>
                                            <option value="html">HTML</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_message_format">فرمت پیام</label></th>
                                    <td><textarea id="wp_eita_channels_${channelIndex}_message_format" name="wp_eita_channels[${channelIndex}][message_format]" class="large-text"></textarea></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_send_woocommerce">فعال کردن یکپارچه‌سازی WooCommerce</label></th>
                                    <td>
                                        <select id="wp_eita_channels_${channelIndex}_send_woocommerce" name="wp_eita_channels[${channelIndex}][send_woocommerce]">
                                            <option value="">هیچ‌کدام</option>
                                            <option value="products">ارسال محصولات جدید</option>
                                            <option value="orders">ارسال سفارش‌های جدید</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_woocommerce_message_format">فرمت پیام WooCommerce</label></th>
                                    <td>
                                        <textarea id="wp_eita_channels_${channelIndex}_woocommerce_message_format" name="wp_eita_channels[${channelIndex}][woocommerce_message_format]" class="large-text"></textarea>
                                        <p class="description">
                                            از جایگزین‌های زیر در فرمت پیام خود استفاده کنید:<br>
                                            <code>[product_name]</code> - نام محصول<br>
                                            <code>[product_price]</code> - قیمت محصول<br>
                                            <code>[product_url]</code> - لینک به محصول<br>
                                            <code>[product_description]</code> - توضیحات محصول<br>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_send_image">ارسال عکس</label></th>
                                    <td><input type="checkbox" id="wp_eita_channels_${channelIndex}_send_image" name="wp_eita_channels[${channelIndex}][send_image]" value="1"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_combine_text_image">ترکیب متن و عکس در یک پیام</label></th>
                                    <td><input type="checkbox" id="wp_eita_channels_${channelIndex}_combine_text_image" name="wp_eita_channels[${channelIndex}][combine_text_image]" value="1"></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_image_position">موقعیت عکس</label></th>
                                    <td>
                                        <select id="wp_eita_channels_${channelIndex}_image_position" name="wp_eita_channels[${channelIndex}][image_position]">
                                            <option value="before">قبل از متن</option>
                                            <option value="after">بعد از متن</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_summary_source">منبع خلاصه مطلب</label></th>
                                    <td>
                                        <select id="wp_eita_channels_${channelIndex}_summary_source" name="wp_eita_channels[${channelIndex}][summary_source]">
                                            <option value="full">متن کامل</option>
                                            <option value="excerpt">خلاصه خبر</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_enable_link_button">فعال کردن دکمه لینک</label></th>
                                    <td><input type="checkbox" id="wp_eita_channels_${channelIndex}_enable_link_button" name="wp_eita_channels[${channelIndex}][enable_link_button]" value="1"></td>
                                </tr>
                                <tr class="link-button-settings" style="display: none;">
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_button_text">متن دکمه</label></th>
                                    <td><input type="text" id="wp_eita_channels_${channelIndex}_button_text" name="wp_eita_channels[${channelIndex}][button_text]" class="regular-text"></td>
                                </tr>
                                <tr class="link-button-settings" style="display: none;">
                                    <th scope="row"><label for="wp_eita_channels_${channelIndex}_button_url">آدرس دکمه</label></th>
                                    <td><input type="text" id="wp_eita_channels_${channelIndex}_button_url" name="wp_eita_channels[${channelIndex}][button_url]" class="regular-text"></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                `;

                $('#wp-eita-channels-accordion').append(channelHtml);
                updateChannelNumbers();
            });

            $(document).on('click', '.wp-eita-remove-channel', function() {
                const channelIndex = $(this).data('index');
                $(this).closest('.wp-eita-channel').remove();
                channelCount--;
                updateChannelNumbers();
            });

            $(document).on('change', '[id^=wp_eita_channels_][id$=_enable_link_button]', function() {
                const settingsRow = $(this).closest('tr').nextAll('.link-button-settings');
                if ($(this).is(':checked')) {
                    settingsRow.show();
                } else {
                    settingsRow.hide();
                }
            });

            $('#aparat-toggle').click(function() {
                $('#aparat-login-form').slideToggle();
            });

            $('#aparat-login-button').click(function() {
                const username = $('#aparat_username').val();
                const password = $('#aparat_password').val();

                if (username === '' || password === '') {
                    alert('لطفا نام کاربری و رمز عبور را وارد کنید.');
                    return;
                }

                $.ajax({
                    url: '/wp-json/wp-eita/v1/aparat-login',
                    method: 'POST',
                    data: {
                        username: username,
                        password: password
                    },
                    success: function(response, status, xhr) {
                        if (xhr.status === 200 && response.login && response.login.ltoken) {
                            alert('ورود موفقیت‌آمیز!');
                            const token = response.login.ltoken;

                            $('#token-row').show();
                            $('#aparat_token').val(token);
                        } else {
                            alert('ورود ناموفق. نام کاربری یا رمز عبور اشتباه است.');
                        }
                    },
                    error: function() {
                        alert('خطایی در ورود رخ داد.');
                    }
                });
            });

            async function hashPassword(password) {
                const encoder = new TextEncoder();
                const data = encoder.encode(password);
                const hash = await crypto.subtle.digest('SHA-256', data);
                return hexString(hash);
            }

            function hexString(buffer) {
                const byteArray = new Uint8Array(buffer);
                const hexCodes = [...byteArray].map(byte => {
                    const hexCode = byte.toString(16);
                    return hexCode.padStart(2, '0');
                });
                return hexCodes.join('');
            }

            $(document).on('click', '.wp-eita-channel-header', function() {
                const content = $(this).next('.wp-eita-channel-content');
                content.slideToggle();
                const icon = $(this).find('.toggle-icon');
                icon.text(icon.text() === 'v' ? '^' : 'v');
            });

            document.addEventListener('DOMContentLoaded', function() {
                const headers = document.querySelectorAll('.wp-eita-channel-header');
                headers.forEach(header => {
                    header.addEventListener('click', function() {
                        const content = this.nextElementSibling;
                        content.style.display = content.style.display === 'none' ? 'block' : 'none';
                        const icon = this.querySelector('.toggle-icon');
                        icon.textContent = icon.textContent === 'v' ? '^' : 'v';
                    });
                });
            });
        });
    </script>

    <?php
}






// نمایش صفحه آمار
function wp_eita_render_stats_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    // Enqueue Chart.js script
    wp_enqueue_script('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js', array(), null, true);

    $channels = get_option('wp_eita_channels', array());
    $channel_stats = array();

    foreach ($channels as $channel) {
        $channel_name = $channel['channel_name'];
        if (!isset($channel_stats[$channel_name])) {
            $channel_stats[$channel_name] = array(
                'posts_sent' => 0,
                'products_sent' => 0,
            );
        }
    }

    // Count the number of posts sent to each channel
    $args = array(
        'post_type' => 'post',
        'posts_per_page' => -1,
        'meta_query' => array(
            'relation' => 'OR',
        ),
    );

    foreach ($channel_stats as $channel_name => $stats) {
        $args['meta_query'][] = array(
            'key' => '_send_to_' . sanitize_title($channel_name),
            'value' => 'yes',
        );
    }

    $posts = get_posts($args);
    foreach ($posts as $post) {
        foreach ($channel_stats as $channel_name => $stats) {
            if (get_post_meta($post->ID, '_send_to_' . sanitize_title($channel_name), true)) {
                $channel_stats[$channel_name]['posts_sent']++;
            }
        }
    }

    // Count the number of products sent to each channel
    $args['post_type'] = 'product';
    $products = get_posts($args);
    foreach ($products as $product) {
        foreach ($channel_stats as $channel_name => $stats) {
            if (get_post_meta($product->ID, '_send_to_' . sanitize_title($channel_name), true)) {
                $channel_stats[$channel_name]['products_sent']++;
            }
        }
    }

    ?>
    <style>
        .channel-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-top: 20px;
        }

        .channel-card {
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
        }

        .channel-card h2 {
            margin-top: 0;
            font-size: 1.5em;
            color: #0073aa;
        }

        .channel-card p {
            margin: 10px 0;
            font-size: 1.2em;
            color: #333;
        }

        .channel-card .active-status {
            background-color: #28a745;
            color: #ffffff;
            padding: 5px 10px;
            border-radius: 4px;
            position: absolute;
            top: 10px;
            left: 10px;
        }
        
        .channel-stats {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            margin-top: 20px;
        }

        .channel-stat {
            display: flex;
            justify-content: space-between;
            width: 100%;
            font-size: 1.2em;
            color: #333;
        }

        .channel-stat span {
            font-size: 1.5em;
            color: #0073aa;
        }
    </style>

    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <div class="channel-container">
            <?php foreach ($channel_stats as $channel_name => $stats): ?>
                <div class="channel-card">
                    <div class="active-status"><?php _e('Active', 'wp-eita'); ?></div>
                    <h2><?php echo esc_html($channel_name); ?></h2>
                    <div class="channel-stats">
                        <div class="channel-stat">
                            <span><?php echo $stats['posts_sent']; ?></span>
                            <p><?php _e('Posts Sent', 'wp-eita'); ?></p>
                        </div>
                        <div class="channel-stat">
                            <span><?php echo $stats['products_sent']; ?></span>
                            <p><?php _e('Products Sent', 'wp-eita'); ?></p>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="chart-container">
            <canvas id="channelStatsChart"></canvas>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            var ctx = document.getElementById('channelStatsChart').getContext('2d');
            var channelStatsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: <?php echo json_encode(array_keys($channel_stats)); ?>,
                    datasets: [{
                        label: '<?php _e('Posts Sent', 'wp-eita'); ?>',
                        data: <?php echo json_encode(array_column($channel_stats, 'posts_sent')); ?>,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }, {
                        label: '<?php _e('Products Sent', 'wp-eita'); ?>',
                        data: <?php echo json_encode(array_column($channel_stats, 'products_sent')); ?>,
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });
    </script>
    <?php
}





// Hook into the admin_init action
add_action('admin_init', 'wp_eita_add_send_to_messengers_checkbox');

function wp_eita_add_send_to_messengers_checkbox() {
    $post_types = get_post_types(array('public' => true), 'names');
    foreach ($post_types as $post_type) {
        if (!in_array($post_type, array('product', 'shop_order'))) {
            add_meta_box(
                'wp_messengers_send_to_messengers',
                'Send to Messengers',
                'wp_messengers_send_to_messengers_callback',
                $post_type,
                'side',
                'high'
            );
        }
    }
}

function wp_messengers_send_to_messengers_callback($post) {
    wp_nonce_field('wp_messengers_send_to_messengers_nonce', 'wp_messengers_send_to_messengers_nonce');

    $channels = get_option('wp_eita_channels', array());
    $selected_channels = get_post_meta($post->ID, '_send_to_channels', true);
    $selected_channels = is_array($selected_channels) ? $selected_channels : array();

    echo '<label for="select_all_channels">';
    echo '<input type="checkbox" id="select_all_channels"> انتخاب همه کانال‌ها';
    echo '</label><br>';

    echo '<select id="wp_messengers_send_to_channels" name="wp_messengers_send_to_channels[]" multiple style="width: 100%;">';
    foreach ($channels as $key => $channel) {
        $selected = in_array($key, $selected_channels) ? 'selected' : '';
        echo '<option value="' . esc_attr($key) . '" ' . $selected . '>' . esc_html($channel['channel_name']) . '</option>';
    }
    echo '</select><br><br>';


    $pin_post = get_post_meta($post->ID, '_pin_post', true);
    $checked_pin_post = ($pin_post == 'yes') ? 'checked' : '';
    echo '<label for="wp_messengers_pin_post">';
    echo '<input type="checkbox" id="wp_messengers_pin_post" name="wp_messengers_pin_post" value="yes" ' . $checked_pin_post . '>';
    echo 'Pin Post';
    echo '</label><br>';

    $disable_notification = get_post_meta($post->ID, '_disable_notification', true);
    $checked_disable_notification = ($disable_notification == 'yes') ? 'checked' : '';
    echo '<label for="wp_messengers_disable_notification">';
    echo '<input type="checkbox" id="wp_messengers_disable_notification" name="wp_messengers_disable_notification" value="yes" ' . $checked_disable_notification . '>';
    echo 'Disable Notification';
    echo '</label>';
}

// Save the meta box data
add_action('save_post', 'wp_messengers_save_send_to_messengers_data', 10, 3);

function wp_messengers_save_send_to_messengers_data($post_id, $post, $update) {
    if (!isset($_POST['wp_messengers_send_to_messengers_nonce']) || !wp_verify_nonce($_POST['wp_messengers_send_to_messengers_nonce'], 'wp_messengers_send_to_messengers_nonce')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (isset($_POST['post_type']) && 'page' === $_POST['post_type']) {
        if (!current_user_can('edit_page', $post_id)) {
            return;
        }
    } else {
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
    }

    $channels = isset($_POST['wp_messengers_send_to_channels']) ? array_map('sanitize_text_field', $_POST['wp_messengers_send_to_channels']) : array();
    update_post_meta($post_id, '_send_to_channels', $channels);

    $pin_post = isset($_POST['wp_messengers_pin_post']) ? sanitize_text_field($_POST['wp_messengers_pin_post']) : '';
    $disable_notification = isset($_POST['wp_messengers_disable_notification']) ? sanitize_text_field($_POST['wp_messengers_disable_notification']) : '';

    update_post_meta($post_id, '_pin_post', $pin_post);
    update_post_meta($post_id, '_disable_notification', $disable_notification);
}

// add_action('wp_insert_post', 'send_post_to_messengers', 10, 3);

// Enqueue Select2 and custom scripts
add_action('admin_enqueue_scripts', 'wp_eita_enqueue_select2');

function wp_eita_enqueue_select2() {
    wp_enqueue_style('select2-css', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css');
    wp_enqueue_script('select2-js', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js', array('jquery'), null, true);
    wp_enqueue_script('wp_eita_custom_js', plugin_dir_url(__FILE__) . 'custom.js', array('jquery', 'select2-js'), null, true);
    wp_enqueue_style('wp_eita_custom_css', plugin_dir_url(__FILE__) . 'custom.css');
}

// JavaScript to handle Select2 and "Select All" checkbox
add_action('admin_footer', 'wp_eita_select2_script');

function wp_eita_select2_script() {
    ?>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            $('#wp_messengers_send_to_channels').select2({
                width: '100%'
            });

            $('#select_all_channels').change(function() {
                var select_all = $(this).prop('checked');
                $('#wp_messengers_send_to_channels > option').prop('selected', select_all);
                $('#wp_messengers_send_to_channels').trigger('change');
            });
        });
    </script>
    <?php
}





// Add a new submenu page for Rubika settings
add_action('admin_menu', 'wp_eita_add_rubika_settings_page');

function wp_eita_add_rubika_settings_page() {
    add_submenu_page('wp_eita_settings', 'Rubika Settings', 'Rubika Settings', 'manage_options', 'wp_eita_rubika_settings', 'wp_eita_render_rubika_settings_page');
}

// Render the Rubika settings page
function wp_eita_render_rubika_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    // Handle form submission
    if (isset($_POST['wp_eita_rubika_submit'])) {
        $rubika_channels = array();
        if (isset($_POST['wp_eita_rubika_channels'])) {
            foreach ($_POST['wp_eita_rubika_channels'] as $channel) {
                if (!empty($channel['channel_name']) && !empty($channel['id_chanel']) && !empty($channel['guid_key']) && !empty($channel['auth_key']) && !empty($channel['private_key'])) {
                    $rubika_channels[] = array(
                        'channel_name' => sanitize_text_field($channel['channel_name']),
                        'id_chanel' => sanitize_text_field($channel['id_chanel']),
                        'guid_key' => sanitize_text_field($channel['guid_key']),
                        'auth_key' => sanitize_text_field($channel['auth_key']),
                        'private_key' => sanitize_text_field($channel['private_key']),
                        'message_format' => sanitize_textarea_field($channel['message_format']),
                        'send_woocommerce' => isset($channel['send_woocommerce']) ? sanitize_text_field($channel['send_woocommerce']) : '',
                        'woocommerce_message_format' => sanitize_textarea_field($channel['woocommerce_message_format']),
                    );
                }
            }
        }
        update_option('wp_eita_rubika_channels', $rubika_channels);
        ?>
        <div class="notice notice-success is-dismissible">
            <p><?php _e('Rubika settings saved.', 'wp-eita'); ?></p>
        </div>
        <?php
    }

    $rubika_channels = get_option('wp_eita_rubika_channels', array());

    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form method="post" action="">
            <table class="form-table wp-eita-settings-table" id="wp-eita-rubika-channels-table">
                <?php foreach ($rubika_channels as $i => $channel): ?>
                    <tr class="wp-eita-rubika-channel">
                        <th colspan="2">
                            <h2>Rubika Channel <?php echo $i + 1; ?></h2>
                            <button type="button" class="button wp-eita-remove-rubika-channel" data-index="<?php echo $i; ?>">Remove Channel</button>
                        </th>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_<?php echo $i; ?>_channel_name">Channel Name</label></th>
                        <td><input type="text" id="wp_eita_rubika_channels_<?php echo $i; ?>_channel_name" name="wp_eita_rubika_channels[<?php echo $i; ?>][channel_name]" value="<?php echo esc_attr($channel['channel_name']); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_<?php echo $i; ?>_id_chanel">ID Chanel</label></th>
                        <td><input type="text" id="wp_eita_rubika_channels_<?php echo $i; ?>_id_chanel" name="wp_eita_rubika_channels[<?php echo $i; ?>][id_chanel]" value="<?php echo esc_attr($channel['id_chanel']); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_<?php echo $i; ?>_guid_key">GUID Key</label></th>
                        <td><input type="text" id="wp_eita_rubika_channels_<?php echo $i; ?>_guid_key" name="wp_eita_rubika_channels[<?php echo $i; ?>][guid_key]" value="<?php echo esc_attr($channel['guid_key']); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_<?php echo $i; ?>_auth_key">Auth Key</label></th>
                        <td><input type="text" id="wp_eita_rubika_channels_<?php echo $i; ?>_auth_key" name="wp_eita_rubika_channels[<?php echo $i; ?>][auth_key]" value="<?php echo esc_attr($channel['auth_key']); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_<?php echo $i; ?>_private_key">Private Key</label></th>
                        <td><input type="text" id="wp_eita_rubika_channels_<?php echo $i; ?>_private_key" name="wp_eita_rubika_channels[<?php echo $i; ?>][private_key]" value="<?php echo esc_attr($channel['private_key']); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_<?php echo $i; ?>_message_format">Message Format</label></th>
                        <td><textarea id="wp_eita_rubika_channels_<?php echo $i; ?>_message_format" name="wp_eita_rubika_channels[<?php echo $i; ?>][message_format]" class="large-text"><?php echo esc_textarea($channel['message_format']); ?></textarea></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_<?php echo $i; ?>_send_woocommerce">Enable WooCommerce Integration</label></th>
                        <td>
                            <select id="wp_eita_rubika_channels_<?php echo $i; ?>_send_woocommerce" name="wp_eita_rubika_channels[<?php echo $i; ?>][send_woocommerce]">
                                <option value="" <?php selected($channel['send_woocommerce'], ''); ?>>None</option>
                                <option value="products" <?php selected($channel['send_woocommerce'], 'products'); ?>>Send New Products</option>
                                <option value="orders" <?php selected($channel['send_woocommerce'], 'orders'); ?>>Send New Orders</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_<?php echo $i; ?>_woocommerce_message_format">WooCommerce Message Format</label></th>
                        <td>
                            <textarea id="wp_eita_rubika_channels_<?php echo $i; ?>_woocommerce_message_format" name="wp_eita_rubika_channels[<?php echo $i; ?>][woocommerce_message_format]" class="large-text"><?php echo esc_textarea($channel['woocommerce_message_format']); ?></textarea>
                            <p class="description">
                                Use the following placeholders in your message format:<br>
                                <code>[product_name]</code> - The name of the product<br>
                                <code>[product_price]</code> - The price of the product<br>
                                <code>[product_url]</code> - The URL to the product<br>
                                <code>[product_description]</code> - The description of the product<br>
                            </p>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <p><button type="button" id="add-rubika-channel" class="button button-secondary">+ Add Rubika Channel</button></p>
            <p class="submit"><input type="submit" name="wp_eita_rubika_submit" id="wp_eita_rubika_submit" class="button button-primary" value="Save Changes"></p>
        </form>
    </div>

    <script>
        jQuery(document).ready(function($) {
            let channelCount = <?php echo count($rubika_channels); ?>;
            const maxChannels = 5;

            function updateChannelNumbers() {
                $('#wp-eita-rubika-channels-table .wp-eita-rubika-channel').each(function(index) {
                    $(this).find('h2').text('Rubika Channel ' + (index + 1));
                    $(this).find('.wp-eita-remove-rubika-channel').attr('data-index', index);
                });
            }

            $('#add-rubika-channel').click(function() {
                if (channelCount >= maxChannels) {
                    alert('You can add a maximum of ' + maxChannels + ' Rubika channels.');
                    return;
                }

                const channelIndex = channelCount;
                channelCount++;

                const channelHtml = `
                    <tr class="wp-eita-rubika-channel">
                        <th colspan="2">
                            <h2>Rubika Channel ${channelIndex + 1}</h2>
                            <button type="button" class="button button-secondary wp-eita-remove-rubika-channel" data-index="${channelIndex}">Remove Channel</button>
                        </th>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_${channelIndex}_channel_name">Channel Name</label></th>
                        <td><input type="text" id="wp_eita_rubika_channels_${channelIndex}_channel_name" name="wp_eita_rubika_channels[${channelIndex}][channel_name]" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_${channelIndex}_id_chanel">ID Chanel</label></th>
                        <td><input type="text" id="wp_eita_rubika_channels_${channelIndex}_id_chanel" name="wp_eita_rubika_channels[${channelIndex}][id_chanel]" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_${channelIndex}_guid_key">GUID Key</label></th>
                        <td><input type="text" id="wp_eita_rubika_channels_${channelIndex}_guid_key" name="wp_eita_rubika_channels[${channelIndex}][guid_key]" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_${channelIndex}_auth_key">Auth Key</label></th>
                        <td><input type="text" id="wp_eita_rubika_channels_${channelIndex}_auth_key" name="wp_eita_rubika_channels[${channelIndex}][auth_key]" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_${channelIndex}_private_key">Private Key</label></th>
                        <td><input type="text" id="wp_eita_rubika_channels_${channelIndex}_private_key" name="wp_eita_rubika_channels[${channelIndex}][private_key]" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_${channelIndex}_message_format">Message Format</label></th>
                        <td><textarea id="wp_eita_rubika_channels_${channelIndex}_message_format" name="wp_eita_rubika_channels[${channelIndex}][message_format]" class="large-text"></textarea></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_${channelIndex}_send_woocommerce">Enable WooCommerce Integration</label></th>
                        <td>
                            <select id="wp_eita_rubika_channels_${channelIndex}_send_woocommerce" name="wp_eita_rubika_channels[${channelIndex}][send_woocommerce]">
                                <option value="">None</option>
                                <option value="products">Send New Products</option>
                                <option value="orders">Send New Orders</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_eita_rubika_channels_${channelIndex}_woocommerce_message_format">WooCommerce Message Format</label></th>
                        <td>
                            <textarea id="wp_eita_rubika_channels_${channelIndex}_woocommerce_message_format" name="wp_eita_rubika_channels[${channelIndex}][woocommerce_message_format]" class="large-text"></textarea>
                            <p class="description">
                                Use the following placeholders in your message format:<br>
                                <code>[product_name]</code> - The name of the product<br>
                                <code>[product_price]</code> - The price of the product<br>
                                <code>[product_url]</code> - The URL to the product<br>
                                <code>[product_description]</code> - The description of the product<br>
                            </p>
                        </td>
                    </tr>
                `;

                $('#wp-eita-rubika-channels-table').append(channelHtml);
                updateChannelNumbers();
            });

            // Remove channel
            $(document).on('click', '.wp-eita-remove-rubika-channel', function() {
                const channelIndex = $(this).data('index');
                $(this).closest('.wp-eita-rubika-channel').nextUntil('tr.wp-eita-rubika-channel').addBack().remove();
                channelCount--;
                updateChannelNumbers();
            });
        });
    </script>
    <?php
}



// افزودن ستون جدید به جدول پست‌ها
add_filter('manage_posts_columns', 'wp_eita_add_custom_column');
add_action('manage_posts_custom_column', 'wp_eita_render_custom_column', 10, 2);

function wp_eita_add_custom_column($columns) {
    $columns['wp_eita_status_resend'] = __('وضعیت و ارسال مجدد', 'wp-eita');
    return $columns;
}

function wp_eita_render_custom_column($column, $post_id) {
    $channels = get_option('wp_eita_channels', array());

    if ($column === 'wp_eita_status_resend') {
        foreach ($channels as $channel) {
            $messenger = $channel['platform'];
            $status = get_post_meta($post_id, '_send_to_' . $messenger, true) ? 'ارسال شده' : 'ارسال نشده';
            $status_text = $channel['channel_name'] . ' : ' . $status;
            $status_class = $status === 'ارسال شده' ? 'status-sent' : 'status-not-sent';
            $platform_color = get_platform_color($messenger);
            $button_label = $status === 'ارسال شده' ? 'ارسال مجدد' : 'ارسال';
            $button_class = $status === 'ارسال شده' ? 'button-resend' : 'button-send';

            echo '<div class="wp-eita-status-container" style="background-color:' . $platform_color . ';">';
            echo '<div class="wp-eita-status ' . $status_class . '">' . $status_text . '</div>';
            echo '<div class="wp-eita-resend-button-container">';
            echo '<button class="button ' . $button_class . ' wp-eita-send-button" data-post-id="' . $post_id . '" data-platform="' . $messenger . '">' . $button_label . '</button>';
            echo '</div>';
            echo '</div>';
        }
    }
}

function get_platform_color($platform) {
    switch ($platform) {
        case 'eita':
            return '#ffcccc'; // رنگ مخصوص ایتا
        case 'bale':
            return '#ccffcc'; // رنگ مخصوص بله
        case 'telegram':
            return '#ccccff'; // رنگ مخصوص تلگرام
        default:
            return '#ffffff'; // رنگ پیش‌فرض
    }
}

add_action('admin_enqueue_scripts', 'wp_eita_admin_scripts');
function wp_eita_admin_scripts() {
    wp_enqueue_script('wp-eita-admin', plugin_dir_url(__FILE__) . 'wp-eita-admin.js', array('jquery'), null, true);
    wp_localize_script('wp-eita-admin', 'wpEita', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('wp_eita_resend_nonce')
    ));
    
    wp_enqueue_style('wp-eita-admin-styles', plugin_dir_url(__FILE__) . 'wp-eita-admin.css');
}


// Adding action for the resend button
add_action('wp_ajax_wp_eita_resend_post', 'wp_eita_resend_post');

function wp_eita_resend_post() {
    check_ajax_referer('wp_eita_resend_nonce', 'security');

    $post_id = intval($_POST['post_id']);
    $platform = sanitize_text_field($_POST['platform']);

    // Send the post to the specific messenger
    send_post_to_specific_messenger($post_id, $platform);

    wp_die();
}

function send_post_to_specific_messenger($post_ID, $platform) {
    $post = get_post($post_ID); // Add this line to get the post object
    if ($post->post_type === 'product' || $post->post_type === 'shop_order') {
        return;
    }

    if (($post->post_status === 'publish') && $post->post_status !== 'trash') {
        $channels = get_option('wp_eita_channels', array());
        $selected_channels = get_post_meta($post_ID, '_send_to_channels', true);

        foreach ($selected_channels as $channel_key) {
            if (!isset($channels[$channel_key])) {
                continue;
            }

            $channel = $channels[$channel_key];
            if (empty($channel['chat_id']) || empty($channel['bot_token']) || empty($channel['platform']) || !$channel['active']) {
                continue;
            }

            $bot_token = $channel['bot_token'];
            $chat_id = $channel['chat_id'];
            $max_character_limit = $channel['max_character_limit'];
            $parse_mode = $channel['parse_mode'];
            $message_format = $channel['message_format'];
            $send_image = $channel['send_image'];
            $combine_text_image = $channel['combine_text_image'];
            $image_position = $channel['image_position'];
            $pin_to_eita = get_post_meta($post_ID, '_pin_post', true);

            $sanitized_post_content = $parse_mode === 'Markdown' ? html_to_markdown($post->post_content) : html_to_text($post->post_content);
            $truncated_post_content = truncate_text($sanitized_post_content, $max_character_limit);

            $tags = get_the_tags($post_ID);
            $hashtags = '';
            if ($tags) {
                foreach ($tags as $tag) {
                    $hashtags .= '#' . str_replace(' ', '_', $tag->name) . ' ';
                }
                $hashtags = trim($hashtags);
            }

            $categories = get_the_category($post_ID);
            $category_list = '';
            if ($categories) {
                foreach ($categories as $category) {
                    $category_list .= $category->name . ' | ';
                }
                $category_list = rtrim($category_list, ' | ');
            }

            $placeholders = array(
                '[post_title]' => $post->post_title,
                '[post_content]' => $truncated_post_content,
                '[post_url]' => get_permalink($post_ID),
                '[post_date]' => get_the_date('', $post_ID),
                '[post_author]' => get_the_author_meta('display_name', $post->post_author),
                '[post_category]' => $category_list,
                '[post_tags]' => $hashtags,
            );

            $formatted_message = strtr($message_format, $placeholders);

            switch ($platform) {
                case 'eita':
                    resend_to_eita($post_ID, $bot_token, $chat_id, $formatted_message, $pin_to_eita, $parse_mode, $send_image, $combine_text_image, $image_position);
                    break;
                case 'bale':
                    resend_to_bale($post_ID, $bot_token, $chat_id, $formatted_message, $parse_mode, $send_image, $combine_text_image, $image_position);
                    break;
                case 'telegram':
                    resend_to_telegram($post_ID, $bot_token, $chat_id, $formatted_message, $parse_mode, $send_image, $combine_text_image, $image_position);
                    break;
            }
        }
        wp_die('Messages sent and processed.');
    }
}

function resend_to_eita($post_ID, $bot_token, $chat_id, $formatted_message, $pin_to_eita, $parse_mode, $send_image, $combine_text_image, $image_position) {
    if ($send_image && has_post_thumbnail($post_ID)) {
        $thumbnail_id = get_post_thumbnail_id($post_ID);
        $file_path = get_attached_file($thumbnail_id);

        if (file_exists($file_path)) {
            if ($combine_text_image) {
                $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendFile');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'file' => new CURLFile($file_path),
                    'caption' => $formatted_message,
                    'chat_id' => $chat_id,
                    'pin' => $pin_to_eita ? 1 : 0,
                    'parse_mode' => $parse_mode
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                echo "Eita response: $response<br>";
                curl_close($request);
            } else {
                $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendFile');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'file' => new CURLFile($file_path),
                    'chat_id' => $chat_id,
                    'pin' => $pin_to_eita ? 1 : 0,
                    'parse_mode' => $parse_mode
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                echo "Eita response: $response<br>";
                curl_close($request);

                $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendMessage');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'text' => $formatted_message,
                    'chat_id' => $chat_id,
                    'pin' => $pin_to_eita ? 1 : 0,
                    'parse_mode' => $parse_mode
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                echo "Eita response: $response<br>";
                curl_close($request);
            }
        }
    } else {
        $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendMessage');
        curl_setopt($request, CURLOPT_POST, true);
        curl_setopt($request, CURLOPT_POSTFIELDS, array(
            'text' => $formatted_message,
            'chat_id' => $chat_id,
            'pin' => $pin_to_eita ? 1 : 0,
            'parse_mode' => $parse_mode
        ));
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($request);
        echo "Eita response: $response<br>";
        curl_close($request);
    }
}

function resend_to_bale($post_ID, $bot_token, $chat_id, $formatted_message, $parse_mode, $send_image, $combine_text_image, $image_position) {
    if ($send_image && has_post_thumbnail($post_ID)) {
        $thumbnail_id = get_post_thumbnail_id($post_ID);
        $file_path = get_attached_file($thumbnail_id);

        if (file_exists($file_path)) {
            if ($combine_text_image) {
                $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendPhoto');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'photo' => new CURLFile($file_path),
                    'caption' => $formatted_message,
                    'chat_id' => $chat_id,
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                $result = json_decode($response, true);
                echo "Bale response: $response<br>";
                echo "Formatted Message Sent with Photo: " . $formatted_message . "<br>";
                curl_close($request);

                if (isset($result['result']['message_id'])) {
                    update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
                    update_post_meta($post_ID, '_bale_file_id', $result['result']['photo'][0]['file_id']);
                }
            } else {
                $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendPhoto');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'photo' => new CURLFile($file_path),
                    'chat_id' => $chat_id,
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                $result = json_decode($response, true);
                echo "Bale response: $response<br>";
                echo "Formatted Message Sent: " . $formatted_message . "<br>";
                curl_close($request);

                if (isset($result['result']['message_id'])) {
                    update_post_meta($post_ID, '_bale_file_id', $result['result']['photo'][0]['file_id']);
                }

                $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendMessage');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'text' => $formatted_message,
                    'chat_id' => $chat_id,
                    'parse_mode' => $parse_mode
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                $result = json_decode($response, true);
                echo "Bale response: $response<br>";
                echo "Formatted Message Sent: " . $formatted_message . "<br>";
                curl_close($request);

                if (isset($result['result']['message_id'])) {
                    update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
                }
            }
        }
    } else {
        $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendMessage');
        curl_setopt($request, CURLOPT_POST, true);
        curl_setopt($request, CURLOPT_POSTFIELDS, array(
            'text' => $formatted_message,
            'chat_id' => $chat_id,
            'parse_mode' => $parse_mode
        ));
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($request);
        $result = json_decode($response, true);
        echo "Bale response: $response<br>";
        curl_close($request);

        if (isset($result['result']['message_id'])) {
            update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
        }
    }
}

function resend_to_telegram($post_ID, $bot_token, $chat_id, $formatted_message, $parse_mode, $send_image, $combine_text_image, $image_position) {
    // Implementation for Telegram
    // Similar to resend_to_eita or resend_to_bale
}














function html_to_markdown($html) {
    // Replace common HTML tags with Markdown equivalents
    $replacements = array(
        '/<h[1-6]>(.*?)<\/h[1-6]>/i' => "\n** $1 **\n", // Headings
        '/<strong>(.*?)<\/strong>/i' => "* $1 *", // Bold
        '/<b>(.*?)<\/b>/i' => "* $1 *", // Bold
        '/<i>(.*?)<\/i>/i' => "_ $1 _", // Italic
        '/<em>(.*?)<\/em>/i' => "_ $1 _", // Italic
        '/<u>(.*?)<\/u>/i' => "__$1__", // Underline
        '/<br\s*\/?>/i' => "\n", // Line breaks
        '/<p>(.*?)<\/p>/i' => "\n$1\n", // Paragraphs
        '/<a\s+href="([^"]+)".*?>(.*?)<\/a>/i' => "[$2]($1)", // Links
        '/<ul>/i' => "\n", // Unordered list start
        '/<\/ul>/i' => "\n", // Unordered list end
        '/<ol>/i' => "\n", // Ordered list start
        '/<\/ol>/i' => "\n", // Ordered list end
        '/<li>(.*?)<\/li>/i' => "* $1\n", // List items
        '/<img\s+src="([^"]+)".*?alt="([^"]*)".*?>/i' => "![alt text]($1 \"$2\")", // Images
        '/\[\[(.*?)\]\]/i' => "`[$1]توضیحات`", // Instant View
    );

    $text = preg_replace(array_keys($replacements), array_values($replacements), $html);

    // Remove any other remaining HTML tags
    $text = strip_tags($text);

    // Decode HTML entities
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

    // Print debug information  
    echo "Converted Markdown: " . $text . "\n";

    return trim($text);
}


function html_to_text($html) {
    $text = strip_tags($html);
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return trim($text);
}

function truncate_text($text, $limit) {
    if (mb_strlen($text) > $limit) {
        return mb_substr($text, 0, $limit - 3) . '...';
    }
    return $text;
}


add_action('wp_insert_post', 'send_post_to_messengers', 10, 3);


function send_post_to_messengers($post_ID, $post, $update) {
    if ($post->post_type === 'product' || $post->post_type === 'shop_order') {
        return;
    }

    if (($update || $post->post_status === 'publish') && $post->post_status !== 'trash') {
        $channels = get_option('wp_eita_channels', array());
        $selected_channels = get_post_meta($post_ID, '_send_to_channels', true);

        foreach ($selected_channels as $channel_key) {
            if (!isset($channels[$channel_key])) {
                continue;
            }

            $channel = $channels[$channel_key];
            if (empty($channel['chat_id']) || empty($channel['bot_token']) || empty($channel['platform']) || !$channel['active']) {
                continue;
            }

            $bot_token = $channel['bot_token'];
            $chat_id = $channel['chat_id'];
            $max_character_limit = $channel['max_character_limit'];
            $parse_mode = $channel['parse_mode'];
            $message_format = $channel['message_format'];
            $platform = $channel['platform'];
            $send_image = $channel['send_image'];
            $combine_text_image = $channel['combine_text_image'];
            $image_position = $channel['image_position'];
            $pin_to_eita = get_post_meta($post_ID, '_pin_post', true);

            $sanitized_post_content = $parse_mode === 'Markdown' ? html_to_markdown($post->post_content) : html_to_text($post->post_content);
            $truncated_post_content = truncate_text($sanitized_post_content, $max_character_limit);

            $tags = get_the_tags($post_ID);
            $hashtags = '';
            if ($tags) {
                foreach ($tags as $tag) {
                    $hashtags .= '#' . str_replace(' ', '_', $tag->name) . ' ';
                }
                $hashtags = trim($hashtags);
            }

            $categories = get_the_category($post_ID);
            $category_list = '';
            if ($categories) {
                foreach ($categories as $category) {
                    $category_list .= $category->name . ' | ';
                }
                $category_list = rtrim($category_list, ' | ');
            }

            $placeholders = array(
                '[post_title]' => $post->post_title,
                '[post_content]' => $truncated_post_content,
                '[post_url]' => get_permalink($post_ID),
                '[post_date]' => get_the_date('', $post_ID),
                '[post_author]' => get_the_author_meta('display_name', $post->post_author),
                '[post_category]' => $category_list,
                '[post_tags]' => $hashtags,
            );

            $formatted_message = strtr($message_format, $placeholders);

            switch ($platform) {
                case 'eita':
                    send_to_eita($post_ID, $bot_token, $chat_id, $formatted_message, $pin_to_eita, $parse_mode, $send_image, $combine_text_image, $image_position);
                    break;
                case 'bale':
                    send_to_bale($post_ID, $bot_token, $chat_id, $formatted_message, $parse_mode, $send_image, $combine_text_image, $image_position);
                    break;
                case 'telegram':
                    send_to_telegram($post_ID, $bot_token, $chat_id, $formatted_message, $parse_mode, $send_image, $combine_text_image, $image_position);
                    break;
            }
        }
        wp_die('Messages sent and processed.');
    }
}

function send_to_eita($post_ID, $bot_token, $chat_id, $formatted_message, $pin_to_eita, $parse_mode, $send_image, $combine_text_image, $image_position) {
    if ($send_image && has_post_thumbnail($post_ID)) {
        $thumbnail_id = get_post_thumbnail_id($post_ID);
        $file_path = get_attached_file($thumbnail_id);

        if (file_exists($file_path)) {
            if ($combine_text_image) {
                $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendFile');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'file' => new CURLFile($file_path),
                    'caption' => $formatted_message,
                    'chat_id' => $chat_id,
                    'pin' => $pin_to_eita ? 1 : 0,
                    'parse_mode' => $parse_mode
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                echo "Eita response: $response<br>";
                curl_close($request);
            } else {
                $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendFile');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'file' => new CURLFile($file_path),
                    'chat_id' => $chat_id,
                    'pin' => $pin_to_eita ? 1 : 0,
                    'parse_mode' => $parse_mode
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                echo "Eita response: $response<br>";
                curl_close($request);

                $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendMessage');
                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_POSTFIELDS, array(
                    'text' => $formatted_message,
                    'chat_id' => $chat_id,
                    'pin' => $pin_to_eita ? 1 : 0,
                    'parse_mode' => $parse_mode
                ));
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($request);
                echo "Eita response: $response<br>";
                curl_close($request);
            }
        }
    } else {
        $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendMessage');
        curl_setopt($request, CURLOPT_POST, true);
        curl_setopt($request, CURLOPT_POSTFIELDS, array(
            'text' => $formatted_message,
            'chat_id' => $chat_id,
            'pin' => $pin_to_eita ? 1 : 0,
            'parse_mode' => $parse_mode
        ));
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($request);
        echo "Eita response: $response<br>";
        curl_close($request);
    }
}

function send_to_bale($post_ID, $bot_token, $chat_id, $formatted_message, $parse_mode, $send_image, $combine_text_image, $image_position) {



    $message_id = get_post_meta($post_ID, '_bale_message_id', true);

    if ($message_id) {
        // چک کنیم که آیا پیام قبلی حاوی عکس بوده است یا خیر
        $file_id = get_post_meta($post_ID, '_bale_file_id', true);

        // پیام قبلی دارای عکس بوده، ولی ما هنوز هم متن را ویرایش می‌کنیم
        $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/editMessageText');
        curl_setopt($request, CURLOPT_POST, true);
        curl_setopt($request, CURLOPT_POSTFIELDS, array(
            'chat_id' => $chat_id,
            'message_id' => $message_id,
            'text' => $formatted_message,
            'parse_mode' => $parse_mode
        ));
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($request);
        $result = json_decode($response, true);
        echo "Bale response: $response<br>";
        echo "Formatted Message Sent: " . $formatted_message . "<br>";
        curl_close($request);

        if (isset($result['error_code']) && $result['error_code'] == 403) {
            echo "Error: Permission denied. Please check bot permissions and chat access.<br>";
        }
    } else {
        if ($send_image && has_post_thumbnail($post_ID)) {
            $thumbnail_id = get_post_thumbnail_id($post_ID);
            $file_path = get_attached_file($thumbnail_id);

            if (file_exists($file_path)) {
                if ($combine_text_image) {
                    // ارسال عکس با کپشن
                    $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendPhoto');
                    curl_setopt($request, CURLOPT_POST, true);
                    curl_setopt($request, CURLOPT_POSTFIELDS, array(
                        'photo' => new CURLFile($file_path),
                        'caption' => $formatted_message,
                        'chat_id' => $chat_id,
                    ));
                    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                    $response = curl_exec($request);
                    $result = json_decode($response, true);
                    echo "Bale response: $response<br>";
                    echo "Formatted Message Sent with Photo: " . $formatted_message . "<br>";
                    curl_close($request);

                    if (isset($result['result']['message_id'])) {
                        update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
                        update_post_meta($post_ID, '_bale_file_id', $result['result']['photo'][0]['file_id']);
                    }
                } else {
                    // ارسال عکس
                    $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendPhoto');
                    curl_setopt($request, CURLOPT_POST, true);
                    curl_setopt($request, CURLOPT_POSTFIELDS, array(
                        'photo' => new CURLFile($file_path),
                        'chat_id' => $chat_id,
                    ));
                    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                    $response = curl_exec($request);
                    $result = json_decode($response, true);
                    echo "Bale response: $response<br>";
                    echo "Formatted Message Sent: " . $formatted_message . "<br>";
                    curl_close($request);

                    if (isset($result['result']['message_id'])) {
                        update_post_meta($post_ID, '_bale_file_id', $result['result']['photo'][0]['file_id']);
                    }

                    // ارسال متن
                    $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendMessage');
                    curl_setopt($request, CURLOPT_POST, true);
                    curl_setopt($request, CURLOPT_POSTFIELDS, array(
                        'text' => $formatted_message,
                        'chat_id' => $chat_id,
                        'parse_mode' => $parse_mode
                    ));
                    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                    $response = curl_exec($request);
                    $result = json_decode($response, true);
                    echo "Bale response: $response<br>";
                    echo "Formatted Message Sent: " . $formatted_message . "<br>";
                    curl_close($request);

                    if (isset($result['result']['message_id'])) {
                        update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
                    }
                }
            }
        } else {
            // ارسال فقط متن
            $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendMessage');
            curl_setopt($request, CURLOPT_POST, true);
            curl_setopt($request, CURLOPT_POSTFIELDS, array(
                'text' => $formatted_message,
                'chat_id' => $chat_id,
                'parse_mode' => $parse_mode
            ));
            curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($request);
            $result = json_decode($response, true);
            echo "Bale response: $response<br>";
            curl_close($request);

            if (isset($result['result']['message_id'])) {
                update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
            }
        }
    }
}

function send_to_telegram($post_ID, $bot_token, $chat_id, $formatted_message, $parse_mode, $send_image, $combine_text_image) {
    if (!get_option('wp_eita_proxy_enabled', 0)) {
        echo "Proxy is disabled. Telegram message not sent.<br>";
        return;
    }

    $message_id = get_post_meta($post_ID, '_telegram_message_id', true);
    $file_path = $send_image && has_post_thumbnail($post_ID) ? get_attached_file(get_post_thumbnail_id($post_ID)) : null;

    $current_message_content = '';
    $current_message_caption = '';

    // Check the current content of the message
    if ($message_id) {
        $url = 'https://api.telegram.org/bot' . $bot_token . '/getUpdates';
        $request = curl_init($url);
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($request);
        $updates = json_decode($response, true);
        curl_close($request);

        if (isset($updates['result'])) {
            foreach ($updates['result'] as $update) {
                if (isset($update['channel_post']) && $update['channel_post']['message_id'] == $message_id) {
                    if (isset($update['channel_post']['text'])) {
                        $current_message_content = $update['channel_post']['text'];
                    }
                    if (isset($update['channel_post']['caption'])) {
                        $current_message_caption = $update['channel_post']['caption'];
                    }
                    break;
                }
            }
        }
    }

    // Function to send a request to Telegram API
    function send_telegram_request($url, $post_fields) {
        $request = curl_init($url);
        curl_setopt($request, CURLOPT_POST, true);
        curl_setopt($request, CURLOPT_POSTFIELDS, $post_fields);
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($request);
        curl_close($request);
        return json_decode($response, true);
    }

    if ($message_id) {
        if ($file_path && file_exists($file_path)) {
            $file_type = mime_content_type($file_path);

            if ($combine_text_image) {
                if ($formatted_message !== $current_message_caption) {
                    $url = 'https://api.telegram.org/bot' . $bot_token . '/editMessageMedia';
                    $media_type = strpos($file_type, 'video') === 0 ? 'video' : 'photo';
                    $media = array(
                        'type' => $media_type,
                        'media' => 'attach://' . $media_type,
                        'caption' => $formatted_message,
                        'parse_mode' => $parse_mode
                    );
                    $post_fields = array(
                        'chat_id' => $chat_id,
                        'message_id' => $message_id,
                        'media' => json_encode($media),
                        $media_type => new CURLFile($file_path)
                    );
                    $response = send_telegram_request($url, $post_fields);
                    echo "Telegram edit media response: " . json_encode($response) . "<br>";
                } else {
                    echo "Content is the same as current content. No need to edit.<br>";
                }
            } else {
                if ($formatted_message !== $current_message_content) {
                    $url = 'https://api.telegram.org/bot' . $bot_token . '/editMessageText';
                    $post_fields = array(
                        'chat_id' => $chat_id,
                        'message_id' => $message_id,
                        'text' => $formatted_message,
                        'parse_mode' => $parse_mode
                    );
                    $response = send_telegram_request($url, $post_fields);

                    if (!$response['ok'] && $response['error_code'] == 400 && strpos($response['description'], 'no text in the message to edit') !== false) {
                        $url = 'https://api.telegram.org/bot' . $bot_token . '/editMessageCaption';
                        $post_fields = array(
                            'chat_id' => $chat_id,
                            'message_id' => $message_id,
                            'caption' => $formatted_message,
                            'parse_mode' => $parse_mode
                        );
                        $response = send_telegram_request($url, $post_fields);
                        echo "Telegram edit caption response: " . json_encode($response) . "<br>";
                    } else {
                        echo "Telegram edit text response: " . json_encode($response) . "<br>";
                    }
                } else {
                    echo "Content is the same as current content. No need to edit.<br>";
                }

                if ($file_path && file_exists($file_path)) {
                    $url = 'https://api.telegram.org/bot' . $bot_token . '/editMessageMedia';
                    $media_type = strpos($file_type, 'video') === 0 ? 'video' : 'photo';
                    $media = array(
                        'type' => $media_type,
                        'media' => 'attach://' . $media_type,
                        'caption' => '' // اینجا را به صورت یک رشته خالی تنظیم کنید
                    );
                    $post_fields = array(
                        'chat_id' => $chat_id,
                        'message_id' => $message_id,
                        'media' => json_encode($media),
                        $media_type => new CURLFile($file_path)
                    );
                    $response = send_telegram_request($url, $post_fields);
                    echo "Telegram edit media response: " . json_encode($response) . "<br>";
                } else {
                    echo "No media found to edit.<br>";
                }
            }
        } else {
            if ($formatted_message !== $current_message_content) {
                $url = 'https://api.telegram.org/bot' . $bot_token . '/editMessageText';
                $post_fields = array(
                    'chat_id' => $chat_id,
                    'message_id' => $message_id,
                    'text' => $formatted_message,
                    'parse_mode' => $parse_mode
                );
                $response = send_telegram_request($url, $post_fields);

                if (!$response['ok'] && $response['error_code'] == 400 && strpos($response['description'], 'no text in the message to edit') !== false) {
                    $url = 'https://api.telegram.org/bot' . $bot_token . '/editMessageCaption';
                    $post_fields = array(
                        'chat_id' => $chat_id,
                        'message_id' => $message_id,
                        'caption' => $formatted_message,
                        'parse_mode' => $parse_mode
                    );
                    $response = send_telegram_request($url, $post_fields);
                    echo "Telegram edit caption response: " . json_encode($response) . "<br>";
                } else {
                    echo "Telegram edit text response: " . json_encode($response) . "<br>";
                }
            } else {
                echo "Content is the same as current content. No need to edit.<br>";
            }
        }
    } else {
        if ($file_path && file_exists($file_path)) {
            $file_type = mime_content_type($file_path);

            if ($combine_text_image) {
                if (in_array($file_type, ['image/jpeg', 'image/png'])) {
                    $url = 'https://api.telegram.org/bot' . $bot_token . '/sendPhoto';
                    $post_fields = array(
                        'chat_id' => $chat_id,
                        'photo' => new CURLFile($file_path),
                        'caption' => $formatted_message,
                        'parse_mode' => $parse_mode
                    );
                } elseif ($file_type === 'video/mp4') {
                    $url = 'https://api.telegram.org/bot' . $bot_token . '/sendVideo';
                    $post_fields = array(
                        'chat_id' => $chat_id,
                        'video' => new CURLFile($file_path),
                        'caption' => $formatted_message,
                        'parse_mode' => $parse_mode
                    );
                } else {
                    echo "Unsupported file type: $file_type<br>";
                    return;
                }
            } else {
                if (in_array($file_type, ['image/jpeg', 'image/png'])) {
                    $url = 'https://api.telegram.org/bot' . $bot_token . '/sendPhoto';
                    $post_fields = array(
                        'chat_id' => $chat_id,
                        'photo' => new CURLFile($file_path)
                    );
                    $response = send_telegram_request($url, $post_fields);
                    echo "Telegram photo response: " . json_encode($response) . "<br>";

                    if (isset($response['result']['message_id'])) {
                        update_post_meta($post_ID, '_telegram_message_id', $response['result']['message_id']);
                    }

                    $url = 'https://api.telegram.org/bot' . $bot_token . '/sendMessage';
                    $post_fields = array(
                        'chat_id' => $chat_id,
                        'text' => $formatted_message,
                        'parse_mode' => $parse_mode
                    );
                } elseif ($file_type === 'video/mp4') {
                    $url = 'https://api.telegram.org/bot' . $bot_token . '/sendVideo';
                    $post_fields = array(
                        'chat_id' => $chat_id,
                        'video' => new CURLFile($file_path)
                    );
                    $response = send_telegram_request($url, $post_fields);
                    echo "Telegram video response: " . json_encode($response) . "<br>";

                    if (isset($response['result']['message_id'])) {
                        update_post_meta($post_ID, '_telegram_message_id', $response['result']['message_id']);
                    }

                    $url = 'https://api.telegram.org/bot' . $bot_token . '/sendMessage';
                    $post_fields = array(
                        'chat_id' => $chat_id,
                        'text' => $formatted_message,
                        'parse_mode' => $parse_mode
                    );
                } else {
                    echo "Unsupported file type: $file_type<br>";
                    return;
                }
            }
        } else {
            $url = 'https://api.telegram.org/bot' . $bot_token . '/sendMessage';
            $post_fields = array(
                'chat_id' => $chat_id,
                'text' => $formatted_message,
                'parse_mode' => $parse_mode
            );
        }
        $response = send_telegram_request($url, $post_fields);
        echo "Telegram send response: " . json_encode($response) . "<br>";

        if (!$message_id && isset($response['result']['message_id'])) {
            update_post_meta($post_ID, '_telegram_message_id', $response['result']['message_id']);
        }
    }
}








add_action('save_post_product', 'send_product_to_messengers', 10, 3);
add_action('woocommerce_thankyou', 'send_order_to_messengers', 10, 1);

function send_product_to_messengers($post_ID, $post, $update) {
    if ($update && $post->post_status === 'publish') {
        send_woocommerce_to_messengers($post_ID, 'product');
    }
}

function send_order_to_messengers($order_id) {
    if ($order_id) {
        send_woocommerce_to_messengers($order_id, 'order');
    }
}

function send_woocommerce_to_messengers($post_ID, $type) {
    $channels = get_option('wp_eita_channels', array());
    $messengers_channels = array();

    foreach ($channels as $channel) {
        if (($channel['send_woocommerce'] === 'products' && $type === 'product') || ($channel['send_woocommerce'] === 'orders' && $type === 'order')) {
            $messengers_channels[$channel['platform']][] = $channel;
        }
    }

    foreach ($messengers_channels as $messenger => $channels) {
        foreach ($channels as $channel) {
            if (empty($channel['chat_id']) || empty($channel['bot_token']) || empty($channel['platform'])) {
                continue;
            }

            $bot_token = $channel['bot_token'];
            $chat_id = $channel['chat_id'];
            $max_character_limit = $channel['max_character_limit'];
            $parse_mode = $channel['parse_mode'];
            $message_format = $channel['woocommerce_message_format'];
            $platform = $channel['platform'];

         if ($type === 'product') {
                $product = wc_get_product($post_ID);
                $product_name = $product->get_name();
                $product_price = $product->get_price();
                $product_url = get_permalink($post_ID);
                $product_description = $product->get_description();
                $product_short_description = $product->get_short_description();
                $product_sanitized_description = $parse_mode === 'Markdown' ? html_to_markdown($product_description) : html_to_text($product_description);
                $product_truncated_description = truncate_text($product_sanitized_description, $max_character_limit);

                $product_sku = $product->get_sku();
                $product_stock = $product->get_stock_quantity();
                $product_categories = wc_get_product_category_list($post_ID, ', ');
                $product_tags = wc_get_product_tag_list($post_ID, ', ');
                $product_image = wp_get_attachment_url($product->get_image_id());
                $product_sale_price = $product->get_sale_price();
                $product_discount_percentage = $product->is_on_sale() ? round((($product->get_regular_price() - $product_sale_price) / $product->get_regular_price()) * 100) : 0;
                $product_date_created = $product->get_date_created()->date('Y-m-d H:i:s');
                $product_rating = $product->get_average_rating();
                $product_reviews = $product->get_reviews_allowed() ? get_comments(array('post_id' => $post_ID, 'number' => 3, 'status' => 'approve')) : [];


                // Generate hashtags from tags with underscores
                $tags = wp_get_post_tags($post_ID);
                $hashtags = '';
                if ($tags) {
                    foreach ($tags as $tag) {
                        $hashtags .= '#' . str_replace(' ', '_', $tag->name) . ' ';
                    }
                    $hashtags = trim($hashtags);
                }

                // Format categories
                $categories = wp_get_post_terms($post_ID, 'product_cat');
                $category_list = '';
                if ($categories) {
                    foreach ($categories as $category) {
                        $category_list .= $category->name . ' | ';
                    }
                    $category_list = rtrim($category_list, ' | ');
                }

                $product_attributes = $product->get_attributes();
                $attributes_list = '';
                if (!empty($product_attributes)) {
                    foreach ($product_attributes as $attribute) {
                        $attributes_list .= $attribute->get_name() . ': ' . implode(', ', $attribute->get_options()) . "\n";
                    }
                }

                $review_text = '';
                if (!empty($product_reviews)) {
                    foreach ($product_reviews as $review) {
                        $review_text .= 'Author: ' . $review->comment_author . "\n";
                        $review_text .= 'Rating: ' . get_comment_meta($review->comment_ID, 'rating', true) . "\n";
                        $review_text .= 'Comment: ' . $review->comment_content . "\n\n";
                    }
                } else {
                    $review_text = 'هیچ دیدگاهی هنوز ثبت نشده است';
                }

                $placeholders = array(
                    '[product_name]' => $product_name,
                    '[product_price]' => $product_price,
                    '[product_url]' => $product_url,
                    '[product_description]' => $product_truncated_description,
                    '[product_short_description]' => $product_short_description,
                    '[product_sku]' => $product_sku,
                    '[product_stock]' => $product_stock,
                    '[product_categories]' => $category_list,
                    '[product_tags]' => $hashtags,
                    '[product_image]' => $product_image,
                    '[product_sale_price]' => $product_sale_price,
                    '[product_discount_percentage]' => $product_discount_percentage,
                    '[product_date_created]' => $product_date_created,
                    '[product_attributes]' => $attributes_list,
                    '[product_rating]' => $product_rating,
                    '[product_reviews]' => $review_text,
                );
            } elseif ($type === 'order') {
                $order = wc_get_order($post_ID);
                $order_total = $order->get_total();
                $order_date = $order->get_date_created()->date('Y-m-d H:i:s');
                $order_billing_name = $order->get_billing_first_name() . ' ' . $order->get_billing_last_name();
                $order_billing_email = $order->get_billing_email();
                $order_shipping_name = $order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name();
                $order_billing_phone = $order->get_billing_phone();
                $order_shipping_address = $order->get_formatted_shipping_address();
                $order_billing_address = $order->get_formatted_billing_address();
                $order_payment_method = $order->get_payment_method_title();
                $order_items = $order->get_items();
                
                $items_list = '';
                foreach ($order_items as $item) {
                    $product_name = $item->get_name();
                    $product_quantity = $item->get_quantity();
                    $product_total = $item->get_total();
                    $items_list .= $product_name . ' x ' . $product_quantity . ' - ' . $product_total . "\n";
                }

                $placeholders = array(
                    '[order_total]' => $order_total,
                    '[order_date]' => $order_date,
                    '[order_billing_name]' => $order_billing_name,
                    '[order_billing_email]' => $order_billing_email,
                    '[order_shipping_name]' => $order_shipping_name,
                    '[order_billing_phone]' => $order_billing_phone,
                    '[order_shipping_address]' => $order_shipping_address,
                    '[order_billing_address]' => $order_billing_address,
                    '[order_payment_method]' => $order_payment_method,
                    '[order_id]' => $post_ID,
                    '[order_items]' => $items_list,
                );
            }


            $formatted_message = strtr($message_format, $placeholders);

            if ($platform == 'eita') {
                if ($type === 'product' && has_post_thumbnail($post_ID)) {
                    $thumbnail_id = get_post_thumbnail_id($post_ID);
                    $file_path = get_attached_file($thumbnail_id);

                    if (file_exists($file_path)) {
                        $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendFile');
                        curl_setopt($request, CURLOPT_POST, true);
                        curl_setopt($request, CURLOPT_POSTFIELDS, array(
                            'file' => new CURLFile($file_path),
                            'caption' => $formatted_message,
                            'chat_id' => $chat_id,
                            'parse_mode' => $parse_mode
                        ));
                        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                        $response = curl_exec($request);
                        curl_close($request);
                    }
                } else {
                    $request = curl_init('https://eitaayar.ir/api/' . $bot_token . '/sendMessage');
                    curl_setopt($request, CURLOPT_POST, true);
                    curl_setopt($request, CURLOPT_POSTFIELDS, array(
                        'text' => $formatted_message,
                        'chat_id' => $chat_id,
                        'parse_mode' => $parse_mode
                    ));
                    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                    $response = curl_exec($request);
                    curl_close($request);
                }
            } elseif ($platform == 'bale') {
                $message_id = get_post_meta($post_ID, '_bale_message_id', true);

                if ($message_id) {
                    $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/editMessageText');
                    curl_setopt($request, CURLOPT_POST, true);
                    curl_setopt($request, CURLOPT_POSTFIELDS, array(
                        'chat_id' => $chat_id,
                        'message_id' => $message_id,
                        'text' => $formatted_message,
                        'parse_mode' => $parse_mode
                    ));
                    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                    $response = curl_exec($request);
                    curl_close($request);
                } else {
                    if ($type === 'product' && has_post_thumbnail($post_ID)) {
                        $thumbnail_id = get_post_thumbnail_id($post_ID);
                        $file_path = get_attached_file($thumbnail_id);

                        if (file_exists($file_path)) {
                            $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendPhoto');
                            curl_setopt($request, CURLOPT_POST, true);
                            curl_setopt($request, CURLOPT_POSTFIELDS, array(
                                'photo' => new CURLFile($file_path),
                                'caption' => $formatted_message,
                                'chat_id' => $chat_id,
                            ));
                            curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                            $response = curl_exec($request);
                            $result = json_decode($response, true);
                            curl_close($request);

                            if (isset($result['result']['message_id'])) {
                                update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
                            }
                        }
                    } else {
                        $request = curl_init('https://tapi.bale.ai/bot' . $bot_token . '/sendMessage');
                        curl_setopt($request, CURLOPT_POST, true);
                        curl_setopt($request, CURLOPT_POSTFIELDS, array(
                            'text' => $formatted_message,
                            'chat_id' => $chat_id,
                            'parse_mode' => $parse_mode
                        ));
                        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
                        $response = curl_exec($request);
                        $result = json_decode($response, true);
                        curl_close($request);

                        if (isset($result['result']['message_id'])) {
                            update_post_meta($post_ID, '_bale_message_id', $result['result']['message_id']);
                        }
                    }
                }
            }
        }
    }
}







