<?php
/*
Plugin Name: Ants RTS — Map Editor (Admin)
Description: WordPress admin Map Editor (94×94 @ 64px) for Ants RTS. Saves maps, sprites, videos & sounds into shared options that the front-end game reads via [ants_game].
Version: 1.8.2
Author: You
*/
if (!defined('ABSPATH')) exit;

/* ======================= GRID / OPTIONS (GUARDED) ======================= */
if (!defined('ANTS_COLS')) define('ANTS_COLS',94);
if (!defined('ANTS_ROWS')) define('ANTS_ROWS',94);
if (!defined('ANTS_TILE')) define('ANTS_TILE',64);
if (!function_exists('ants_total')){ function ants_total(){ return ANTS_COLS*ANTS_ROWS; } }

if (!defined('ANTS_MAPS_OPTION'))    define('ANTS_MAPS_OPTION','ants_rts_maps');
if (!defined('ANTS_CURRENT_OPTION')) define('ANTS_CURRENT_OPTION','ants_rts_current');
if (!defined('ANTS_LEGACY_OPTION'))  define('ANTS_LEGACY_OPTION','ants_rts_map'); // legacy single-map payload
if (!defined('ANTS_SPRITES_OPTION')) define('ANTS_SPRITES_OPTION','ants_rts_sprites');

/* new: videos + sounds options (used by front-end ants.js) */
if (!defined('ANTS_VIDEOS_OPTION'))  define('ANTS_VIDEOS_OPTION','ants_rts_videos'); // intro, win, lose
if (!defined('ANTS_SOUNDS_OPTION'))  define('ANTS_SOUNDS_OPTION','ants_rts_sounds'); // click, recruit, buildDone, heal, trap, enemy, deposit, gather, victory, defeat

/* =========================== HELPERS (GUARDED) ========================== */
if (!function_exists('ants_slugify')){
  function ants_slugify($s){ $s = strtolower( sanitize_title( (string)$s ) ); return $s ?: 'map'; }
}
if (!function_exists('ants_get_maps')){ function ants_get_maps(){ $m=get_option(ANTS_MAPS_OPTION); return is_array($m)?$m:[]; } }
if (!function_exists('ants_set_maps')){ function ants_set_maps($m){ update_option(ANTS_MAPS_OPTION,$m,false); } }
if (!function_exists('ants_get_current')){ function ants_get_current(){ $s=get_option(ANTS_CURRENT_OPTION); return is_string($s)?$s:''; } }
if (!function_exists('ants_set_current')){ function ants_set_current($s){ update_option(ANTS_CURRENT_OPTION,$s,false); } }

if (!function_exists('ants_default_payload')){
  function ants_default_payload(){
    $n=ants_total();
    return [
      'gridCols'=>ANTS_COLS,'gridRows'=>ANTS_ROWS,
      'gridTiles'=>array_fill(0,$n,''),           // tile image URLs
      'gridWalk' =>array_fill(0,$n,'W'),          // W,S,B
      'gridTags' =>array_fill(0,$n,'NONE'),       // NONE,BASE,FOOD,GOLD,BONUS
      'settings'=>['tileSize'=>ANTS_TILE,'normalSpeed'=>1.0,'slowMultiplier'=>0.5,'bonusAuto'=>false,'bonusCount'=>0],
    ];
  }
}

if (!function_exists('ants_normalize_payload')){
  function ants_normalize_payload($tiles,$walk,$tags,$settings){
    $n=ants_total();
    $T=array_values(array_pad(array_slice(is_array($tiles)?$tiles:[],0,$n),$n,'')); 
    $Wsrc=array_values(array_pad(array_slice(is_array($walk)?$walk:[],0,$n),$n,'W'));
    $Gsrc=array_values(array_pad(array_slice(is_array($tags)?$tags:[],0,$n),$n,'NONE'));

    $W=[]; $G=[];
    for($i=0;$i<$n;$i++){
      $v=$Wsrc[$i]; $W[$i]=in_array($v,['W','B','S'],true)?$v:'W';
      $g=strtoupper((string)$Gsrc[$i]); $G[$i]=in_array($g,['NONE','BASE','FOOD','GOLD','BONUS'],true)?$g:'NONE';
      $T[$i]=is_string($T[$i])?esc_url_raw($T[$i]):'';
    }

    $set=['tileSize'=>ANTS_TILE,'normalSpeed'=>1.0,'slowMultiplier'=>0.5,'bonusAuto'=>false,'bonusCount'=>0];
    if(is_array($settings)){
      $set['tileSize']=intval($settings['tileSize']??ANTS_TILE);
      $set['normalSpeed']=floatval($settings['normalSpeed']??1.0);
      $set['slowMultiplier']=floatval($settings['slowMultiplier']??0.5);
      $set['bonusAuto']=!empty($settings['bonusAuto']);
      $set['bonusCount']=intval($settings['bonusCount']??0);
    }

    return [
      'gridCols'=>ANTS_COLS,'gridRows'=>ANTS_ROWS,
      'gridTiles'=>$T,'gridWalk'=>$W,'gridTags'=>$G,'settings'=>$set
    ];
  }
}

/* ======================= SPRITES (GUARDED) ===================== */
if (!function_exists('ants_get_sprites')){
  function ants_get_sprites(){
    $d=get_option(ANTS_SPRITES_OPTION);
    if(!is_array($d)) $d=[];
    // Include building sprites + trap decorations
    return array_merge([
      'fighter'=>'','food'=>'','gold'=>'','builder'=>'','fire'=>'','bomber'=>'','queen'=>'','nest'=>'',
      'barracks'=>'','upgrade'=>'','hospital'=>'',
      'fireTile'=>'','bombTile'=>'',
    ], $d);
  }
}
if (!function_exists('ants_set_sprites')){
  function ants_set_sprites($arr){
    update_option(ANTS_SPRITES_OPTION, [
      'fighter'=>esc_url_raw($arr['fighter']??''),
      'food'   =>esc_url_raw($arr['food']??''),
      'gold'   =>esc_url_raw($arr['gold']??''),
      'builder'=>esc_url_raw($arr['builder']??''),
      'fire'   =>esc_url_raw($arr['fire']??''),
      'bomber' =>esc_url_raw($arr['bomber']??''),
      'queen'  =>esc_url_raw($arr['queen']??''),
      'nest'   =>esc_url_raw($arr['nest']??''),
      'barracks'=>esc_url_raw($arr['barracks']??''),
      'upgrade' =>esc_url_raw($arr['upgrade']??''),
      'hospital'=>esc_url_raw($arr['hospital']??''),
      'fireTile'=>esc_url_raw($arr['fireTile']??''),
      'bombTile'=>esc_url_raw($arr['bombTile']??''),
    ], false);
  }
}

/* ======================= VIDEOS (new) ========================= */
if (!function_exists('ants_get_videos')){
  function ants_get_videos(){
    $d=get_option(ANTS_VIDEOS_OPTION);
    if(!is_array($d)) $d=[];
    return array_merge([
      'intro'=>'','win'=>'','lose'=>''
    ], $d);
  }
}
if (!function_exists('ants_set_videos')){
  function ants_set_videos($arr){
    update_option(ANTS_VIDEOS_OPTION, [
      'intro'=>esc_url_raw($arr['intro']??''),
      'win'  =>esc_url_raw($arr['win']??''),
      'lose' =>esc_url_raw($arr['lose']??''),
    ], false);
  }
}

/* ======================= SOUNDS (new) ========================= */
if (!function_exists('ants_get_sounds')){
  function ants_get_sounds(){
    $d=get_option(ANTS_SOUNDS_OPTION);
    if(!is_array($d)) $d=[];
    return array_merge([
      'click'=>'','recruit'=>'','buildDone'=>'','heal'=>'','trap'=>'',
      'enemy'=>'','deposit'=>'','gather'=>'','victory'=>'','defeat'=>''
    ], $d);
  }
}
if (!function_exists('ants_set_sounds')){
  function ants_set_sounds($arr){
    update_option(ANTS_SOUNDS_OPTION, [
      'click'    =>esc_url_raw($arr['click']??''),
      'recruit'  =>esc_url_raw($arr['recruit']??''),
      'buildDone'=>esc_url_raw($arr['buildDone']??''),
      'heal'     =>esc_url_raw($arr['heal']??''),
      'trap'     =>esc_url_raw($arr['trap']??''),
      'enemy'    =>esc_url_raw($arr['enemy']??''),
      'deposit'  =>esc_url_raw($arr['deposit']??''),
      'gather'   =>esc_url_raw($arr['gather']??''),
      'victory'  =>esc_url_raw($arr['victory']??''),
      'defeat'   =>esc_url_raw($arr['defeat']??''),
    ], false);
  }
}

/* ===== One-shot legacy migration & diagnostics (keeps old maps) ===== */
add_action('admin_init', function(){
  if (!current_user_can('manage_options')) return;

  $maps  = get_option(ANTS_MAPS_OPTION);
  $legacy= get_option(ANTS_LEGACY_OPTION); // old single-map payload

  if ((!is_array($maps) || !count($maps)) && is_array($legacy) && isset($legacy['gridTiles'])) {
    $slug = 'migrated-map';
    $now  = current_time('mysql');
    $maps = [
      $slug => [
        'name'    => 'Migrated Map',
        'slug'    => $slug,
        'created' => $now,
        'updated' => $now,
        'data'    => $legacy,
      ],
    ];
    update_option(ANTS_MAPS_OPTION, $maps, false);
    update_option(ANTS_CURRENT_OPTION, $slug, false);
    add_action('admin_notices', function(){
      echo '<div class="updated notice"><p>[ANTS] Migrated legacy map from <code>ants_rts_map</code> into <code>ants_rts_maps</code>. If the list didn\'t refresh, reload this page.</p></div>';
    });
  }

  $mapsAfter=get_option(ANTS_MAPS_OPTION);
  if (!is_array($mapsAfter) || !count($mapsAfter)) {
    add_action('admin_notices', function(){
      $site = is_multisite() ? (' (site ID '.get_current_blog_id().')') : '';
      echo '<div class="notice notice-warning"><p>[ANTS] No maps found in <code>ants_rts_maps</code>'.$site.'. If you used the single-file plugin before, it may have saved only to <code>ants_rts_map</code>. This editor auto-migrates when it detects that.</p></div>';
    });
  }
});

/* ======================== ADMIN PAGE ========================= */
add_action('admin_menu', function(){
  add_menu_page('Ants Editor','Ants Editor','manage_options','ants-map-editor','ants_map_editor_page','dashicons-grid-view',56);
});
add_action('admin_enqueue_scripts', function($hook){
  if ($hook==='toplevel_page_ants-map-editor' || (isset($_GET['page']) && $_GET['page']==='ants-map-editor')) {
    wp_enqueue_media();
  }
});

/* ======================== EDITOR UI =========================== */
if (!function_exists('ants_map_editor_page')){
function ants_map_editor_page(){
  $notice_html=''; $error_html='';

  if ($_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['ants_nonce']) && wp_verify_nonce($_POST['ants_nonce'],'ants_all')){
    $action   = sanitize_text_field($_POST['ants_action']??'');
    $maps     = ants_get_maps();

    if (in_array($action,['save','save_update','save_new'],true)){
      $raw = wp_unslash($_POST['ants_map_json']??''); $d=json_decode($raw,true);
      if(!$d || !isset($d['gridTiles'],$d['gridWalk'],$d['gridTags'],$d['settings'])){
        $error_html.='<div class="error notice"><p>[ANTS] Invalid payload.</p></div>';
      } else {
        $payload = ants_normalize_payload($d['gridTiles'],$d['gridWalk'],$d['gridTags'],$d['settings']);
        $selected= ants_slugify($_POST['ants_select']??'');
        $newName = sanitize_text_field($_POST['ants_new_name']??'');
        $filled  = count(array_filter($payload['gridTiles']));
        $mode    = $action;
        if($action==='save'){ $mode = ($selected && isset($maps[$selected]))?'save_update':'save_new'; }

        if($mode==='save_update'){
          if($selected && isset($maps[$selected])){
            $maps[$selected]['data']=$payload;
            $maps[$selected]['updated']=current_time('mysql');
            ants_set_maps($maps); ants_set_current($selected);
            update_option(ANTS_LEGACY_OPTION,$payload,false);
            $notice_html.='<div class="updated notice"><p>[ANTS] Saved (update): <code>'.esc_html($maps[$selected]['name']).'</code> • tiles='.$filled.'/'.ants_total().'</p></div>';
          } else {
            $error_html.='<div class="error notice"><p>[ANTS] Select a map to update or use Save As New.</p></div>';
          }
        } else { // save_new
          if(count($maps)>=10){
            $error_html.='<div class="error notice"><p>[ANTS] Limit reached (10 maps).</p></div>';
          } else {
            if($newName==='') $newName='Map '.(count($maps)+1);
            $slug=ants_slugify($newName); $base=$slug; $i=2;
            while(isset($maps[$slug])){ $slug=$base.'-'.$i; $i++; }
            $maps[$slug]=[
              'name'=>$newName,'slug'=>$slug,
              'created'=>current_time('mysql'),'updated'=>current_time('mysql'),
              'data'=>$payload
            ];
            ants_set_maps($maps); ants_set_current($slug);
            update_option(ANTS_LEGACY_OPTION,$payload,false);
            $notice_html.='<div class="updated notice"><p>[ANTS] Saved (new): <code>'.esc_html($newName).'</code> • tiles='.$filled.'/'.ants_total().'</p></div>';
          }
        }
      }
    } elseif($action==='load'){
      $slug=ants_slugify($_POST['ants_select']??'');
      if($slug && isset($maps[$slug])){
        ants_set_current($slug);
        update_option(ANTS_LEGACY_OPTION,$maps[$slug]['data'],false);
        $filled=count(array_filter($maps[$slug]['data']['gridTiles']));
        $notice_html.='<div class="updated notice"><p>[ANTS] Loaded <code>'.esc_html($maps[$slug]['name']).'</code> • tiles='.$filled.'/'.ants_total().'</p></div>';
      } else $error_html.='<div class="error notice"><p>[ANTS] Pick a map to load.</p></div>';
    } elseif($action==='delete'){
      $slug=ants_slugify($_POST['ants_select']??'');
      if($slug && isset($maps[$slug])){
        unset($maps[$slug]); ants_set_maps($maps);
        if(ants_get_current()===$slug) ants_set_current('');
        $notice_html.='<div class="updated notice"><p>[ANTS] Deleted map.</p></div>';
      } else $error_html.='<div class="error notice"><p>[ANTS] Pick a map to delete.</p></div>';
    } elseif($action==='save_sprites'){
      ants_set_sprites([
        'fighter'=>sanitize_text_field($_POST['ants_sprite_fighter']??''),
        'food'   =>sanitize_text_field($_POST['ants_sprite_food']??''),
        'gold'   =>sanitize_text_field($_POST['ants_sprite_gold']??''),
        'builder'=>sanitize_text_field($_POST['ants_sprite_builder']??''),
        'fire'   =>sanitize_text_field($_POST['ants_sprite_fire']??''),
        'bomber' =>sanitize_text_field($_POST['ants_sprite_bomber']??''),
        'queen'  =>sanitize_text_field($_POST['ants_sprite_queen']??''),
        'nest'   =>sanitize_text_field($_POST['ants_sprite_nest']??''),
        'barracks'=>sanitize_text_field($_POST['ants_sprite_barracks']??''),
        'upgrade' =>sanitize_text_field($_POST['ants_sprite_upgrade']??''),
        'hospital'=>sanitize_text_field($_POST['ants_sprite_hospital']??''),
        'fireTile'=>sanitize_text_field($_POST['ants_sprite_fireTile']??''),
        'bombTile'=>sanitize_text_field($_POST['ants_sprite_bombTile']??''),
      ]);
      $notice_html.='<div class="updated notice"><p>[ANTS] Sprites saved.</p></div>';
    } elseif($action==='save_videos'){
      ants_set_videos([
        'intro'=>sanitize_text_field($_POST['ants_video_intro']??''),
        'win'  =>sanitize_text_field($_POST['ants_video_win']??''),
        'lose' =>sanitize_text_field($_POST['ants_video_lose']??''),
      ]);
      $notice_html.='<div class="updated notice"><p>[ANTS] Videos saved.</p></div>';
    } elseif($action==='save_sounds'){
      ants_set_sounds([
        'click'    =>sanitize_text_field($_POST['ants_sound_click']??''),
        'recruit'  =>sanitize_text_field($_POST['ants_sound_recruit']??''),
        'buildDone'=>sanitize_text_field($_POST['ants_sound_buildDone']??''),
        'heal'     =>sanitize_text_field($_POST['ants_sound_heal']??''),
        'trap'     =>sanitize_text_field($_POST['ants_sound_trap']??''),
        'enemy'    =>sanitize_text_field($_POST['ants_sound_enemy']??''),
        'deposit'  =>sanitize_text_field($_POST['ants_sound_deposit']??''),
        'gather'   =>sanitize_text_field($_POST['ants_sound_gather']??''),
        'victory'  =>sanitize_text_field($_POST['ants_sound_victory']??''),
        'defeat'   =>sanitize_text_field($_POST['ants_sound_defeat']??''),
      ]);
      $notice_html.='<div class="updated notice"><p>[ANTS] Sounds saved.</p></div>';
    }
  }

  /* Bootstrap payload (always shows the grid, even if empty) */
  $maps=ants_get_maps(); $curr=ants_get_current(); $boot=null;
  if($curr && isset($maps[$curr])) $boot=$maps[$curr]['data'];
  if(!$boot){ $legacy=get_option(ANTS_LEGACY_OPTION); if(is_array($legacy)) $boot=$legacy; }
  if(!$boot) $boot=ants_default_payload();

  $n=ants_total();
  $tiles=array_values(array_pad(array_slice($boot['gridTiles']??[],0,$n),$n,'')); 
  $walk =array_values(array_pad(array_slice($boot['gridWalk'] ??[],0,$n),$n,'W'));
  $tags =array_values(array_pad(array_slice($boot['gridTags'] ??[],0,$n),$n,'NONE'));

  $boot=['gridCols'=>ANTS_COLS,'gridRows'=>ANTS_ROWS,'gridTiles'=>$tiles,'gridWalk'=>$walk,'gridTags'=>$tags,
    'settings'=>array_merge(['tileSize'=>ANTS_TILE,'normalSpeed'=>1.0,'slowMultiplier'=>0.5,'bonusAuto'=>false,'bonusCount'=>0], is_array($boot['settings']??null)?$boot['settings']:[])];
  $BOOT=wp_json_encode($boot);
  $worldW=ANTS_COLS*ANTS_TILE; $worldH=ANTS_ROWS*ANTS_TILE;

  /* Existing sprites + new videos/sounds payloads */
  $SPR=ants_get_sprites();
  $VID=ants_get_videos();
  $SND=ants_get_sounds();
  ?>
  <div class="wrap">
    <h1>Ants Map Editor — 94×94 (<?php echo esc_html($worldW.'×'.$worldH); ?>)</h1>
    <?php echo $notice_html.$error_html; ?>

    <!-- =================== MAP EDITOR (restored) =================== -->
    <form method="post" id="ants-form" style="margin-top:12px">
      <?php wp_nonce_field('ants_all','ants_nonce'); ?>
      <input type="hidden" name="ants_map_json" id="ants_map_json" value="">

      <div style="display:grid;gap:10px;grid-template-columns:1fr auto auto;align-items:end;max-width:1080px;margin-bottom:8px">
        <div>
          <label style="display:block;margin-bottom:4px;">Saved Maps (max 10)</label>
          <select id="ants_select" name="ants_select" style="width:100%;padding:6px 8px;border-radius:8px;border:1px solid #ccd">
            <option value="">— none —</option>
            <?php foreach(ants_get_maps() as $slug=>$m){ $sel=selected($slug,ants_get_current(),false); echo '<option value="'.esc_attr($slug).'" '.$sel.'>'.esc_html($m['name']).'</option>'; } ?>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;">Load / Delete</label>
          <button class="button" name="ants_action" value="load">Load</button>
          <button class="button" name="ants_action" value="delete" onclick="return confirm('Delete selected map?')">Delete</button>
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;">New Map Name (optional)</label>
          <input id="ants_new_name" name="ants_new_name" type="text" placeholder="e.g. Gigafield" style="width:260px;padding:6px 8px;border-radius:8px;border:1px solid #ccd" />
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px">
        <button class="button" name="ants_action" value="save_update">Save (Update)</button>
        <button class="button" name="ants_action" value="save_new">Save As New</button>
        <button class="button button-primary" name="ants_action" value="save" id="btnSave">💾 Save Map</button>
        <button type="button" class="button" id="btnFillEmpty">Fill Empty with Selected</button>
      </div>

      <div class="panel" style="background:#151923;border:1px solid #242a36;border-radius:12px;padding:12px;color:#e7eaf1">
        <div class="hint" style="color:#9aa3b5;margin:0 0 8px">
          Grid <b><?php echo ANTS_COLS.'×'.ANTS_ROWS; ?></b> • Tile <b><?php echo ANTS_TILE; ?>px</b> • World <b><?php echo $worldW.'×'.$worldH; ?></b><br>
          Tap tile → pick image (Media Library). <b>Shift-click</b> toggles selection. Walk W/S/B. Tags BASE/FOOD/GOLD/BONUS.
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 8px">
          <button type="button" class="tool-btn" id="btnWalk">Walk</button>
          <button type="button" class="tool-btn" id="btnSlow">Slow</button>
          <button type="button" class="tool-btn" id="btnBlock">Block</button>
          <button type="button" class="tag-btn" id="btnBase">Base</button>
          <button type="button" class="tag-btn" id="btnFood">Food</button>
          <button type="button" class="tag-btn" id="btnGold">Gold</button>
          <button type="button" class="tag-btn" id="btnBonus">Bonus</button>
          <button type="button" class="tag-btn" id="btnTagNone">Tag None</button>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:6px 0 12px">
          <label style="display:flex;gap:8px;align-items:center;background:#0c0f16;border:1px solid #242a36;border-radius:8px;padding:6px 10px">
            <input type="checkbox" id="bonusAuto"> Randomize bonus on Save (strict)
          </label>
          <label>Count <input type="number" id="bonusCount" min="0" max="5000" step="1" value="0" style="width:90px;padding:6px 8px;border-radius:8px;border:1px solid #242a36;background:#0c0f16;color:#e7eaf1"></label>
          <button type="button" class="button" id="btnBonusNow">Randomize Bonus Now</button>
        </div>

        <!-- the GRID (this is the “map maker” block) -->
        <div id="gridWrap" style="max-width:100%;overflow:auto;border:1px solid #242a36;border-radius:12px;-webkit-overflow-scrolling:touch;overflow-anchor:none">
          <div id="grid" style="display:grid;grid-template-columns:repeat(<?php echo ANTS_COLS; ?>,<?php echo ANTS_TILE; ?>px);grid-auto-rows:<?php echo ANTS_TILE; ?>px;width:<?php echo $worldW; ?>px;height:<?php echo $worldH; ?>px;background:
              linear-gradient(#0000,#0000) padding-box,
              linear-gradient(to right, #2b3140 1px, transparent 1px),
              linear-gradient(to bottom, #2b3140 1px, transparent 1px);
              background-size:100% 100%, <?php echo ANTS_TILE; ?>px 100%, 100% <?php echo ANTS_TILE; ?>px;"></div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          <button type="button" id="btnClearSel">Clear Selected</button>
          <button type="button" id="btnClearAll" style="background:#5b2030;border-color:#7a2a40;color:#ffeef3">Clear All</button>
        </div>

        <div style="margin-top:10px">
          <button type="button" id="btnExpJson" class="button button-primary">Export JSON</button>
          <button type="button" id="btnExpJS" class="button button-primary">Export Game JS</button>
          <textarea id="out" readonly style="width:100%;min-height:160px;background:#0c0f16;border:1px solid #242a36;border-radius:8px;color:#e7eaf1;padding:8px;margin-top:6px"></textarea>
        </div>
      </div>

      <style>
        .tool-btn,.tag-btn{background:#e9eef8!important;color:#111!important;border:1px solid #c9d2e4!important;border-radius:8px;padding:8px 10px;cursor:pointer}
        .cell{position:relative;border:1px solid rgba(255,255,255,.06);margin:-1px 0 0 -1px;cursor:pointer;background-size:cover;background-position:center;image-rendering:pixelated}
        .sel{outline:2px solid #7bd88f!important;box-shadow:0 0 0 2px rgba(123,216,143,.25) inset}
        .walk-W{box-shadow:0 0 0 1px rgba(255,255,255,.65) inset,0 0 10px 2px rgba(255,255,255,.45),0 0 22px 6px rgba(255,255,255,.25)}
        .walk-S{box-shadow:0 0 0 1px rgba(255,220,120,.7) inset,0 0 10px 2px rgba(255,220,120,.55),0 0 22px 6px rgba(255,220,120,.35)}
        .walk-B{box-shadow:0 0 0 1px rgba(255,90,90,.75) inset,0 0 10px 2px rgba(255,90,90,.55),0 0 22px 6px rgba(255,90,90,.35)}
        .cell::after{content:attr(data-w);position:absolute;left:3px;top:3px;font:700 11px/1 ui-monospace,Consolas,Menlo,monospace;padding:2px 4px;border-radius:4px;color:#cfd4e0;background:rgba(255,255,255,.08)}
        .cell.walk-S::after{color:#ffdd88}.cell.walk-B::after{color:#ff7a7a}
        .cell::before{content:attr(data-tag);position:absolute;right:3px;bottom:3px;font:700 10px/1 ui-monospace,Consolas,Menlo,monospace;padding:2px 4px;border-radius:4px;color:#0b0f16;background:rgba(255,255,255,.9)}
        .cell[data-tag="NONE"]::before{content:'';padding:0}
        .cell[data-tag="BASE"]::before{background:#a8e6ff;color:#07202a}
        .cell[data-tag="FOOD"]::before{background:#b8ffb1;color:#0f2710}
        .cell[data-tag="GOLD"]::before{background:#ffe89a;color:#3a2b00}
        .cell[data-tag="BONUS"]::before{background:#ffb1e1;color:#2f001f}
      </style>

      <script>
      (function(){
        const COLS=<?php echo (int)ANTS_COLS; ?>, ROWS=<?php echo (int)ANTS_ROWS; ?>, TOTAL=COLS*ROWS, TILE=<?php echo (int)ANTS_TILE; ?>;
        const BOOT=<?php echo $BOOT ? $BOOT : '{}'; ?>;
        const gridEl=document.getElementById('grid'), out=document.getElementById('out'), form=document.getElementById('ants-form');

        const tiles=(BOOT.gridTiles&&BOOT.gridTiles.length===TOTAL)?BOOT.gridTiles.slice():Array(TOTAL).fill('');
        const walk =(BOOT.gridWalk &&BOOT.gridWalk.length===TOTAL)?BOOT.gridWalk.slice() :Array(TOTAL).fill('W');
        const tags =(BOOT.gridTags &&BOOT.gridTags.length===TOTAL)?BOOT.gridTags.slice() :Array(TOTAL).fill('NONE');

        const sel=new Set(); let lastFocus=-1;
        const bonusAutoEl=document.getElementById('bonusAuto');
        const bonusCountEl=document.getElementById('bonusCount');
        bonusAutoEl.checked=!!(BOOT.settings&&BOOT.settings.bonusAuto);
        bonusCountEl.value=(BOOT.settings&&typeof BOOT.settings.bonusCount==='number')?BOOT.settings.bonusCount:0;

        // Build the grid (map maker)
        for(let i=0;i<TOTAL;i++){
          const d=document.createElement('div');
          d.className='cell walk-'+(walk[i]||'W'); d.dataset.i=i; d.dataset.w=(walk[i]||'W'); d.dataset.tag=(tags[i]||'NONE');
          if(tiles[i]) d.style.backgroundImage=`url('${tiles[i]}')`;
          gridEl.appendChild(d);
        }
        const idx=e=>+e.target.dataset.i;
        function paint(i){
          const d=gridEl.children[i];
          d.style.backgroundImage=tiles[i]?`url('${tiles[i]}')`:'none';
          d.className='cell walk-'+(walk[i]||'W'); d.dataset.w=(walk[i]||'W'); d.dataset.tag=(tags[i]||'NONE');
          if(sel.has(i)) d.classList.add('sel');
        }
        function setMany(arr,fn){ arr.forEach(i=>{ fn(i); paint(i); }); }

        function pickOneFromMedia(cb){
          const frame=wp.media({title:'Select Tile Image',button:{text:'Use this image'},multiple:false});
          frame.on('select',()=>{
            const m=frame.state().get('selection').first();
            const url=m&&m.get('url'); if(!url) return; cb(url);
          });
          frame.open();
        }
        function openMediaPicker(targets){ pickOneFromMedia(url=>setMany(targets,i=>tiles[i]=url)); }
        function targetsForAction(){ if(sel.size) return [...sel]; if(lastFocus>=0) return [lastFocus]; alert('Tap a tile first.'); return []; }

        gridEl.addEventListener('click', e=>{
          if(!e.target.classList.contains('cell')) return;
          const i=idx(e); lastFocus=i;
          if(e.shiftKey){ sel.has(i)?sel.delete(i):sel.add(i); paint(i); return; }
          const targets=sel.size?[...sel]:[i]; openMediaPicker(targets);
        });
        gridEl.addEventListener('contextmenu', e=>{
          if(!e.target.classList.contains('cell')) return;
          e.preventDefault(); const i=idx(e);
          const targets=sel.size?[...sel]:[i];
          setMany(targets,k=>{ tiles[k]=''; walk[k]='W'; tags[k]='NONE'; }); sel.clear();
        });

        document.getElementById('btnWalk').onclick =()=>{ const t=targetsForAction(); if(!t.length) return; t.forEach(i=>{ walk[i]='W'; paint(i); }); };
        document.getElementById('btnSlow').onclick =()=>{ const t=targetsForAction(); if(!t.length) return; t.forEach(i=>{ walk[i]='S'; paint(i); }); };
        document.getElementById('btnBlock').onclick=()=>{ const t=targetsForAction(); if(!t.length) return; t.forEach(i=>{ walk[i]='B'; paint(i); }); };

        document.getElementById('btnBase').onclick  =()=>{ const t=targetsForAction(); if(!t.length) return; t.forEach(i=>{ tags[i]='BASE'; paint(i); }); };
        document.getElementById('btnFood').onclick  =()=>{ const t=targetsForAction(); if(!t.length) return; t.forEach(i=>{ tags[i]='FOOD'; paint(i); }); };
        document.getElementById('btnGold').onclick  =()=>{ const t=targetsForAction(); if(!t.length) return; t.forEach(i=>{ tags[i]='GOLD'; paint(i); }); };
        document.getElementById('btnBonus').onclick =()=>{ const t=targetsForAction(); if(!t.length) return; t.forEach(i=>{ tags[i]='BONUS'; paint(i); }); };
        document.getElementById('btnTagNone').onclick=()=>{ const t=targetsForAction(); if(!t.length) return; t.forEach(i=>{ tags[i]='NONE'; paint(i); }); };

        function randomizeBonusStrict(n){
          for(let i=0;i<TOTAL;i++){ if(tags[i]==='BONUS'){ tags[i]='NONE'; paint(i);} }
          const pool=[]; for(let i=0;i<TOTAL;i++){ if(walk[i]==='W') pool.push(i); }
          const K=Math.max(0,Math.min(Number(n)||0,pool.length));
          for(let i=0;i<K;i++){
            const j=i+Math.floor(Math.random()*(pool.length-i));
            const tmp=pool[i]; pool[i]=pool[j]; pool[j]=tmp;
            const id=pool[i]; tags[id]='BONUS'; paint(id);
          }
          return K;
        }
        document.getElementById('btnBonusNow').onclick=()=>{ const n=parseInt(bonusCountEl.value||'0',10); randomizeBonusStrict(n); };

        document.getElementById('btnFillEmpty').onclick=()=>{ pickOneFromMedia(url=>{
          let filled=0; for(let i=0;i<TOTAL;i++){ if(!tiles[i]){ tiles[i]=url; paint(i); filled++; } }
          alert('Filled '+filled+' empty tiles.');
        }); };
        document.getElementById('btnClearSel').onclick=()=>{ if(!sel.size) return; setMany([...sel],i=>{ tiles[i]=''; walk[i]='W'; tags[i]='NONE'; }); sel.clear(); };
        document.getElementById('btnClearAll').onclick=()=>{ if(!confirm('Clear ALL tiles?')) return; for(let i=0;i<TOTAL;i++){ tiles[i]=''; walk[i]='W'; tags[i]='NONE'; paint(i); } sel.clear(); };

        function exportJSON(){
          return JSON.stringify({
            gridCols:COLS,gridRows:ROWS,
            gridTiles:tiles,gridWalk:walk,gridTags:tags,
            settings:{tileSize:TILE,normalSpeed:1.0,slowMultiplier:0.5,bonusAuto:bonusAutoEl.checked,bonusCount:Number(bonusCountEl.value||0)}
          },null,2);
        }
        function exportGameJS(){
          const t=tiles.map(u=>JSON.stringify(u)).join(', ');
          const w=walk.map(v=>JSON.stringify(v)).join(', ');
          const g=tags.map(v=>JSON.stringify(v)).join(', ');
          return [
            '// ==== Ants Map (generated) ==== ',
            'const MAP={',
            '  cols:'+COLS+', rows:'+ROWS+',',
            '  tiles:['+t+'],',
            '  walk:['+w+'], // W,S,B',
            '  tags:['+g+']  // NONE,BASE,FOOD,GOLD,BONUS',
            '};',
            'const SETTINGS={tileSize:'+TILE+',normalSpeed:1.0,slowMultiplier:0.5};'
          ].join('\n');
        }
        document.getElementById('btnExpJson').onclick=()=>{ out.value=exportJSON(); };
        document.getElementById('btnExpJS').onclick  =()=>{ out.value=exportGameJS(); };

        form.addEventListener('submit',e=>{
          const sub=e.submitter||document.activeElement;
          const action=sub&&sub.name==='ants_action'?sub.value:'';          
          if(['save','save_new','save_update'].includes(action)){
            if(bonusAutoEl.checked){ const n=parseInt(bonusCountEl.value||'0',10); randomizeBonusStrict(n); }
            document.getElementById('ants_map_json').value=exportJSON();
          }
        });
      })();
      </script>
    </form>

    <!-- =================== SPRITES (unchanged) =================== -->
    <?php
      $roles=[
        ['fighter','Fighter'],['food','Food Collector'],['gold','Gold Collector'],['builder','Builder'],
        ['fire','Fire Ant'],['bomber','Bomber Ant'],['queen','Queen Ant'],['nest','Nest (base tile)'],
        ['barracks','Barracks (building)'],['upgrade','Upgrade Center (building)'],['hospital','Hospital (building)'],
        ['fireTile','Fire Trap Decoration'],['bombTile','Bomb Trap Decoration'],
      ];
    ?>
    <div class="panel" style="background:#141924;border:1px solid #242a36;border-radius:12px;padding:12px;color:#e7eaf1;margin-top:12px">
      <h2 style="margin:0 0 10px">Ant Sprites</h2>
      <p style="color:#9aa3b5;margin-top:0">
        Pick images (Media Library). Thumbnails update live. Leave blank for colored circles.
      </p>
      <style>
        .ants-sprite-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:1080px}
        .ants-sprite-cell{background:#0c0f16;border:1px solid #242a36;border-radius:10px;padding:10px}
        .ants-sprite-thumb{width:64px;height:64px;border-radius:8px;border:1px solid #2a3240;background:#0b0f10;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:8px}
        .ants-sprite-thumb img{max-width:100%;max-height:100%;image-rendering:pixelated}
        .ants-sprite-row{display:flex;gap:8px;align-items:center}
        .ants-sprite-row input[type="text"]{flex:1;padding:6px 8px;border-radius:8px;border:1px solid #242a36;background:#0c0f16;color:#e7eaf1}
      </style>
      <form method="post" style="margin:0">
        <?php wp_nonce_field('ants_all','ants_nonce'); ?>
        <input type="hidden" name="ants_action" value="save_sprites" />
        <div class="ants-sprite-grid">
          <?php foreach($roles as $r): $k=$r[0]; $label=$r[1]; $val=esc_attr($SPR[$k]??''); ?>
          <div class="ants-sprite-cell">
            <div style="font-weight:600;margin-bottom:6px"><?php echo esc_html($label); ?></div>
            <div class="ants-sprite-thumb"><img id="thumb_<?php echo esc_attr($k); ?>" src="<?php echo $val; ?>" alt=""></div>
            <div class="ants-sprite-row">
              <input type="text" id="inp_<?php echo esc_attr($k); ?>" name="ants_sprite_<?php echo esc_attr($k); ?>" placeholder="https://..." value="<?php echo $val; ?>">
              <button type="button" class="button" data-pick="<?php echo esc_attr($k); ?>">Media…</button>
              <button type="button" class="button" data-clear="<?php echo esc_attr($k); ?>">Clear</button>
            </div>
          </div>
          <?php endforeach; ?>
        </div>
        <div style="margin-top:12px"><button class="button button-primary" name="ants_action" value="save_sprites">💾 Save Sprites</button></div>
      </form>
      <script>
        (function(){
          let frame=null;
          function pick(key){
            if(!frame){
              frame=wp.media({title:'Select Ant Image',button:{text:'Use this image'},multiple:false});
              frame.on('select',()=>{
                const m=frame.state().get('selection').first();
                const url=m&&m.get('url'); if(!url) return;
                if(pick._key){
                  const k=pick._key;
                  const inp=document.getElementById('inp_'+k), img=document.getElementById('thumb_'+k);
                  if(inp) inp.value=url; if(img) img.src=url;
                }
              });
            }
            pick._key=key; frame.open();
          }
          document.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>pick(b.getAttribute('data-pick'))));
          document.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',()=>{
            const k=b.getAttribute('data-clear');
            const inp=document.getElementById('inp_'+k), img=document.getElementById('thumb_'+k);
            if(inp) inp.value=''; if(img) img.src='';
          }));
          ['fighter','food','gold','builder','fire','bomber','queen','nest','barracks','upgrade','hospital','fireTile','bombTile'].forEach(k=>{
            const inp=document.getElementById('inp_'+k), img=document.getElementById('thumb_'+k);
            if(inp&&img) inp.addEventListener('input',()=>{ img.src=inp.value.trim(); });
          });
        })();
      </script>
    </div>

    <!-- =================== VIDEOS (new) =================== -->
    <div class="panel" style="background:#141924;border:1px solid #242a36;border-radius:12px;padding:12px;color:#e7eaf1;margin-top:12px">
      <h2 style="margin:0 0 10px">Videos (Intro / Win / Lose)</h2>
      <form method="post" style="margin:0">
        <?php wp_nonce_field('ants_all','ants_nonce'); ?>
        <input type="hidden" name="ants_action" value="save_videos" />
        <style>.ants-row{display:grid;grid-template-columns:140px 1fr auto auto;gap:8px;align-items:center;max-width:900px;margin-bottom:8px}</style>
        <?php
          $rows=[['intro','Intro Video'],['win','Win Video'],['lose','Lose Video']];
          foreach($rows as $row):
            $k=$row[0]; $label=$row[1]; $val=esc_attr($VID[$k]??''); ?>
            <div class="ants-row">
              <div style="font-weight:600"><?php echo esc_html($label); ?></div>
              <input type="text" id="vid_<?php echo esc_attr($k); ?>" name="ants_video_<?php echo esc_attr($k); ?>" placeholder="https://video.mp4" value="<?php echo $val; ?>" style="padding:6px 8px;border-radius:8px;border:1px solid #242a36;background:#0c0f16;color:#e7eaf1">
              <button type="button" class="button" data-pickv="<?php echo esc_attr($k); ?>">Media…</button>
              <button type="button" class="button" data-clearv="<?php echo esc_attr($k); ?>">Clear</button>
            </div>
        <?php endforeach; ?>
        <div><button class="button button-primary">💾 Save Videos</button></div>
      </form>
      <script>
        (function(){
          let frame=null;
          function pickVideo(key){
            if(!frame){
              frame=wp.media({title:'Select Video',library:{type:'video'},button:{text:'Use this video'},multiple:false});
              frame.on('select',()=>{
                const m=frame.state().get('selection').first();
                const url=m&&m.get('url'); if(!url) return;
                if(pickVideo._key){
                  const k=pickVideo._key;
                  const inp=document.getElementById('vid_'+k);
                  if(inp) inp.value=url;
                }
              });
            }
            pickVideo._key=key; frame.open();
          }
          document.querySelectorAll('[data-pickv]').forEach(b=>b.addEventListener('click',()=>pickVideo(b.getAttribute('data-pickv'))));
          document.querySelectorAll('[data-clearv]').forEach(b=>b.addEventListener('click',()=>{
            const k=b.getAttribute('data-clearv');
            const inp=document.getElementById('vid_'+k); if(inp) inp.value='';
          }));
        })();
      </script>
    </div>

    <!-- =================== SOUNDS (new) =================== -->
    <div class="panel" style="background:#141924;border:1px solid #242a36;border-radius:12px;padding:12px;color:#e7eaf1;margin-top:12px">
      <h2 style="margin:0 0 10px">Sound Effects</h2>
      <p style="color:#9aa3b5;margin-top:0">Pick short audio files (MP3/OGG). These are referenced in the game’s settings menu and events.</p>
      <form method="post" style="margin:0">
        <?php wp_nonce_field('ants_all','ants_nonce'); ?>
        <input type="hidden" name="ants_action" value="save_sounds" />
        <style>.ants-snd-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:1080px}.snd-row{display:grid;grid-template-columns:150px 1fr auto auto;gap:8px;align-items:center}</style>
        <div class="ants-snd-grid">
          <?php
            $soundRows=[
              ['click','Click/Select'],['recruit','Recruit'],['buildDone','Build Complete'],['heal','Heal'],
              ['trap','Trap Place/Trip'],['enemy','Enemy Spawn'],['gather','Gather Start'],['deposit','Deposit'],
              ['victory','Victory'],['defeat','Defeat']
            ];
            foreach($soundRows as $row):
              $k=$row[0]; $label=$row[1]; $val=esc_attr($SND[$k]??''); ?>
              <div class="snd-row">
                <div style="font-weight:600"><?php echo esc_html($label); ?></div>
                <input type="text" id="snd_<?php echo esc_attr($k); ?>" name="ants_sound_<?php echo esc_attr($k); ?>" placeholder="https://sound.mp3" value="<?php echo $val; ?>" style="padding:6px 8px;border-radius:8px;border:1px solid #242a36;background:#0c0f16;color:#e7eaf1">
                <button type="button" class="button" data-picks="<?php echo esc_attr($k); ?>">Media…</button>
                <button type="button" class="button" data-clears="<?php echo esc_attr($k); ?>">Clear</button>
              </div>
          <?php endforeach; ?>
        </div>
        <div style="margin-top:10px"><button class="button button-primary">💾 Save Sounds</button></div>
      </form>
      <script>
        (function(){
          let frame=null;
          function pickSound(key){
            if(!frame){
              frame=wp.media({title:'Select Audio',library:{type:'audio'},button:{text:'Use this audio'},multiple:false});
              frame.on('select',()=>{
                const m=frame.state().get('selection').first();
                const url=m&&m.get('url'); if(!url) return;
                if(pickSound._key){
                  const k=pickSound._key;
                  const inp=document.getElementById('snd_'+k);
                  if(inp) inp.value=url;
                }
              });
            }
            pickSound._key=key; frame.open();
          }
          document.querySelectorAll('[data-picks]').forEach(b=>b.addEventListener('click',()=>pickSound(b.getAttribute('data-picks'))));
          document.querySelectorAll('[data-clears]').forEach(b=>b.addEventListener('click',()=>{
            const k=b.getAttribute('data-clears');
            const inp=document.getElementById('snd_'+k); if(inp) inp.value='';
          }));
        })();
      </script>
    </div>
  </div>
  <?php
}}
