<?php
/**
 * Plugin Name: Lite Ad Server Integration
 * Description: Easy integration with Lite Ad Server
 * Version: 1.0.0
 */

class LiteAdServerWP {
    public function __construct() {
        add_action('init', array($this, 'init'));
    }

    public function init() {
        add_action('wp_head', array($this, 'add_ad_script'));
        add_shortcode('lite-ad', array($this, 'render_ad_shortcode'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    public function render_ad_shortcode($atts) {
        $config = shortcode_atts(array(
            'format' => 'banner',
            'size' => '728x90',
            'placement' => 'content',
            'targeting' => ''
        ), $atts);

        return $this->generate_ad_html($config);
    }

    private function generate_ad_html($config) {
        $targeting = !empty($config['targeting']) ? json_encode(explode(',', $config['targeting'])) : '{}';

        return sprintf(
            '<div data-lite-ad data-format="%s" data-size="%s" data-placement="%s" data-targeting=\'%s\'></div>',
            esc_attr($config['format']),
            esc_attr($config['size']),
            esc_attr($config['placement']),
            esc_attr($targeting)
        );
    }
}

new LiteAdServerWP();
