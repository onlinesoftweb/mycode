<?php
/*
Plugin Name: Ants RTS — Game (Front-end)
Description: Front-end canvas RTS for Ants. Shortcode: [ants_game]
Version: 2.8.1
Author: You
*/
if (!defined('ABSPATH')) exit;

/* ===== Grid / Options ===== */
if (!defined('ANTS_COLS'))            define('ANTS_COLS',94);
if (!defined('ANTS_ROWS'))            define('ANTS_ROWS',94);
if (!defined('ANTS_TILE'))            define('ANTS_TILE',64);
if (!function_exists('ants_total')){  function ants_total(){ return ANTS_COLS*ANTS_ROWS; } }

if (!defined('ANTS_MAPS_OPTION'))     define('ANTS_MAPS_OPTION','ants_rts_maps');
if (!defined('ANTS_CURRENT_OPTION'))  define('ANTS_CURRENT_OPTION','ants_rts_current');
if (!defined('ANTS_LEGACY_OPTION'))   define('ANTS_LEGACY_OPTION','ants_rts_map');       // legacy single-map payload
if (!defined('ANTS_SPRITES_OPTION'))  define('ANTS_SPRITES_OPTION','ants_rts_sprites');
if (!defined('ANTS_VIDEOS_OPTION'))   define('ANTS_VIDEOS_OPTION','ants_rts_videos');    // intro, win, lose
if (!defined('ANTS_SOUNDS_OPTION'))   define('ANTS_SOUNDS_OPTION','ants_rts_sounds');    // click, recruit, buildDone, heal, trap, enemy, deposit, gather, victory, defeat

function ants_get_maps(){ $m=get_option(ANTS_MAPS_OPTION); return is_array($m)?$m:[]; }
function ants_get_current(){ $s=get_option(ANTS_CURRENT_OPTION); return is_string($s)?$s:''; }

/**
 * Sprites used by the game. Includes: roles, buildings, trap decorations.
 * Keys must match what ants.js expects.
 */
function ants_get_sprites(){
  $d=get_option(ANTS_SPRITES_OPTION);
  if(!is_array($d)) $d=[];
  return array_merge([
    'fighter'=>'','food'=>'','gold'=>'','builder'=>'','fire'=>'','bomber'=>'','queen'=>'','nest'=>'',
    'barracks'=>'','upgrade'=>'','hospital'=>'',
    'fireTile'=>'','bombTile'=>'',
  ], $d);
}

/** Videos (intro / win / lose) */
function ants_get_videos(){
  $d=get_option(ANTS_VIDEOS_OPTION);
  if(!is_array($d)) $d=[];
  return array_merge([
    'intro'=>'','win'=>'','lose'=>''
  ], $d);
}

/** Sounds (UI + gameplay events) */
function ants_get_sounds(){
  $d=get_option(ANTS_SOUNDS_OPTION);
  if(!is_array($d)) $d=[];
  return array_merge([
    'click'=>'','recruit'=>'','buildDone'=>'','heal'=>'','trap'=>'',
    'enemy'=>'','deposit'=>'','gather'=>'','victory'=>'','defeat'=>''
  ], $d);
}

/** Boot payload (map) */
function ants_get_boot_map_payload(){
  $maps=ants_get_maps(); $curr=ants_get_current(); $boot=null;
  if($curr && isset($maps[$curr])) $boot=$maps[$curr]['data'];
  if(!$boot){ $legacy=get_option(ANTS_LEGACY_OPTION); if(is_array($legacy)) $boot=$legacy; }
  if(!$boot){
    $n=ants_total();
    $boot=['gridCols'=>ANTS_COLS,'gridRows'=>ANTS_ROWS,
      'gridTiles'=>array_fill(0,$n,''),'gridWalk'=>array_fill(0,$n,'W'),'gridTags'=>array_fill(0,$n,'NONE'),
      'settings'=>['tileSize'=>ANTS_TILE,'normalSpeed'=>1.0,'slowMultiplier'=>0.5,'bonusAuto'=>false,'bonusCount'=>0]];
  }
  $n=ants_total();
  $tiles=array_values(array_pad(array_slice($boot['gridTiles']??[],0,$n),$n,'')); 
  $walk =array_values(array_pad(array_slice($boot['gridWalk'] ??[],0,$n),$n,'W'));
  $tags =array_values(array_pad(array_slice($boot['gridTags'] ??[],0,$n),$n,'NONE'));
  return ['gridCols'=>ANTS_COLS,'gridRows'=>ANTS_ROWS,'gridTiles'=>$tiles,'gridWalk'=>$walk,'gridTags'=>$tags,
    'settings'=>array_merge(['tileSize'=>ANTS_TILE,'normalSpeed'=>1.0,'slowMultiplier'=>0.5,'bonusAuto'=>false,'bonusCount'=>0], is_array($boot['settings']??null)?$boot['settings']:[])];
}

/* ===== Page detection ===== */
function ants_rts_on_game_page(){
  if (!is_singular()) return false;
  global $post; if (!$post) return false;
  return strpos((string)$post->post_content, '[ants_game]') !== false;
}

/* ===== Minimal conflict strip ===== */
function ants_rts_strip_conflicts(){
  if (!ants_rts_on_game_page()) return;
  // Dequeue known crasher(s) on Ants pages.
  $bad=['rcg'];
  global $wp_scripts,$wp_styles;
  if (is_object($wp_scripts) && is_array($wp_scripts->queue)) {
    foreach ($wp_scripts->queue as $h) {
      $src=(string)($wp_scripts->registered[$h]->src ?? '');
      foreach ($bad as $frag){ if ($src && strpos($src,$frag)!==false){ wp_dequeue_script($h); wp_deregister_script($h); break; } }
    }
  }
  if (is_object($wp_styles) && is_array($wp_styles->queue)) {
    foreach ($wp_styles->queue as $h) {
      $src=(string)($wp_styles->registered[$h]->src ?? '');
      foreach ($bad as $frag){ if ($src && strpos($src,$frag)!==false){ wp_dequeue_style($h); wp_deregister_style($h); break; } }
    }
  }
}
add_action('wp_enqueue_scripts','ants_rts_strip_conflicts',9999);

/* ===== Assets ===== */
function ants_rts_enqueue_assets(){
  $base = plugin_dir_url(__FILE__) . 'assets/';
  // version bump to 2.8.1 to match ants.js changes and bust caches
  wp_register_style ('ants-rts-css', $base.'ants.css', [], '2.8.1');
  wp_register_script('ants-rts-js',  $base.'ants.js',  [], '2.8.1', true);
}
add_action('init','ants_rts_enqueue_assets');

/* ===== Shortcode ===== */
add_shortcode('ants_game', function(){
  wp_enqueue_style('ants-rts-css');
  wp_enqueue_script('ants-rts-js');

  // Localize map + assets
  wp_localize_script('ants-rts-js','ANTS_BOOT',    ants_get_boot_map_payload());
  wp_localize_script('ants-rts-js','ANT_SPRITES',  ants_get_sprites());
  wp_localize_script('ants-rts-js','ANT_VIDEOS',   ants_get_videos());
  wp_localize_script('ants-rts-js','ANT_SOUNDS',   ants_get_sounds());

  ob_start(); ?>
  <div class="ants-root" id="ants-root" data-ants>
    <canvas id="ants-hud" aria-hidden="true"></canvas>
    <canvas id="ants-view" aria-label="Ants RTS World"></canvas>

    <!-- Nav pad -->
    <div class="ants-pad" id="ants-pad" aria-label="Map navigation">
      <button data-pan="up-left">↖</button><button data-pan="up">↑</button><button data-pan="up-right">↗</button>
      <button data-pan="left">←</button><button data-pan="center">•</button><button data-pan="right">→</button>
      <button data-pan="down-left">↙</button><button data-pan="down">↓</button><button data-pan="down-right">↘</button>
    </div>

    <!-- Edge panners -->
    <div class="ants-edge left"  data-edge="left"></div>
    <div class="ants-edge right" data-edge="right"></div>
    <div class="ants-edge top"   data-edge="top"></div>
    <div class="ants-edge bottom"data-edge="bottom"></div>

    <!-- Overlay + in-DOM modal (no iframe) -->
    <div id="ants-overlay" role="dialog" aria-modal="true" aria-live="polite"><div id="ants-banner"></div></div>
  </div>
  <?php
  return ob_get_clean();
});
