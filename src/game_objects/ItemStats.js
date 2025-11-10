import { rand_int } from '../generators/dungeon_generation.js';

export class ItemList {
  constructor(item_list_json) {
    this.items = [];
    this.item_by_level = {};
    try {
      var item_list = JSON.parse(item_list_json);
      for(var item_idx in item_list) {
        var item = new Item(item_list[item_idx]);
        this.handle_new_item(item);
      }
    } catch(e) {
      console.log(e);
    }
  }

  handle_new_item(item) {
    this.items.push(item);
    if(item.level) {
      if(!this.item_by_level[item.level]) {
        this.item_by_level[item.level] = [];
      }

      this.item_by_level[item.level].push(item);
    }
  }

  rand_item_by_prob(item_set, prob_key='norm_score') {
    var allowed_drop = Math.random();
    var min_dx = 1.0;
    var item_to_drop = false;
    
    for(var item_idx in item_set) {
      var drop_rate = 1.0 - item_set[item_idx][prob_key];
      var dx = Math.abs(drop_rate - allowed_drop);

      if(dx < min_dx) {
        min_dx = dx;
        item_to_drop = item_set[item_idx];
      }
    }

    return item_to_drop;
  }
}

export class Item {
  constructor(parsed_json_item) {
    for(var key in parsed_json_item) {
      this[key] = parsed_json_item[key];
    }
  }

  global_drop_rate() {
    return 1.0 - this.norm_score;
  }

  level_drop_rate() {
    return 1.0 - this.lvl_norm_score;
  }
}
