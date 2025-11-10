use serde::Serialize;
use std::ops::{Add, AddAssign, DivAssign, SubAssign};

trait Scalable {
    fn apply_scalar(self, scalar: f32) -> Self;
}

trait Squarable {
    fn apply_square(self) -> Self;
}

trait Rootable {
    fn apply_square_root(self) -> Self;
}

macro_rules! single_stat {
    ($stat_name: ident, $stat_ty: tt) => {
        fn $stat_name($stat_name: $stat_ty) -> Self {
            let mut default = Self::default();
            default.$stat_name = $stat_name;

            default
        }
    };

    ($effect_name: ident, $cost_name: ident, $cost_val: expr, $benefit_name: ident, $benefit_val: expr) => {
        fn $effect_name() -> Self {
            Self {
                cost: EntityStats::$cost_name($cost_val),
                benefit: ItemStats::$benefit_name($benefit_val),
                multiplyer: 1.0,
            }
        }
    };
}

macro_rules! consumption_modifier {
    ($effect_name: ident, $consumption_ty: ident, $scalar: expr) => {
        fn $effect_name() -> Self {
            Self {
                cost: EntityStats::default(),
                benefit: ItemStats::$consumption_ty($scalar),
                multiplyer: 1.0,
            }
        }
    };
}

macro_rules! regen_modifier {
    ($effect_name: ident, $cost_name: ident, $cost_scalar: expr, $benefit_name: ident, $benefit_scalar: expr) => {
        fn $effect_name() -> Self {
            Self {
                cost: EntityStats::$cost_name($cost_scalar) + EntityStats::intelligence(1),
                benefit: ItemStats::$benefit_name($benefit_scalar),
                multiplyer: 1.0,
            }
        }
    };
}

fn normalize(zscore: f32, min_zscore: f32, max_zscore: f32) -> f32 {
    (zscore - min_zscore) / (max_zscore - min_zscore)
}

#[derive(Clone, Debug, Serialize)]
struct EntityStats {
    strength: i32,
    endurance: i32,
    dexterity: i32,
    intelligence: i32,
    vitality: i32,
    magic: i32,
    luck: i32,
}

impl Rootable for EntityStats {
    fn apply_square_root(self) -> Self {
        Self {
            strength: (self.strength as f32).sqrt() as i32,
            endurance: (self.endurance as f32).sqrt() as i32,
            dexterity: (self.dexterity as f32).sqrt() as i32,
            intelligence: (self.intelligence as f32).sqrt() as i32,
            vitality: (self.vitality as f32).sqrt() as i32,
            magic: (self.magic as f32).sqrt() as i32,
            luck: (self.luck as f32).sqrt() as i32,
        }
    }
}

impl Squarable for EntityStats {
    fn apply_square(self) -> Self {
        Self {
            strength: self.strength * self.strength,
            endurance: self.endurance * self.endurance,
            dexterity: self.dexterity * self.dexterity,
            intelligence: self.intelligence * self.intelligence,
            vitality: self.vitality * self.vitality,
            magic: self.magic * self.magic,
            luck: self.luck * self.luck,
        }
    }
}

impl Scalable for EntityStats {
    fn apply_scalar(self, scalar: f32) -> Self {
        Self {
            strength: self.strength * scalar as i32,
            endurance: self.endurance * scalar as i32,
            dexterity: self.dexterity * scalar as i32,
            intelligence: self.intelligence * scalar as i32,
            vitality: self.vitality * scalar as i32,
            magic: self.magic * scalar as i32,
            luck: self.luck * scalar as i32,
        }
    }
}

impl Default for EntityStats {
    fn default() -> Self {
        Self {
            strength: 0,
            endurance: 0,
            dexterity: 0,
            intelligence: 0,
            vitality: 0,
            magic: 0,
            luck: 0,
        }
    }
}

impl EntityStats {
    single_stat!(strength, i32);
    single_stat!(endurance, i32);
    single_stat!(dexterity, i32);
    single_stat!(intelligence, i32);
    single_stat!(vitality, i32);
    single_stat!(magic, i32);
    single_stat!(luck, i32);
}

impl DivAssign for EntityStats {
    fn div_assign(&mut self, other: Self) {
        *self = Self {
            strength: self.strength / other.strength,
            endurance: self.endurance / other.endurance,
            dexterity: self.dexterity / other.dexterity,
            intelligence: self.intelligence / other.intelligence,
            vitality: self.vitality / other.vitality,
            magic: self.magic / other.magic,
            luck: self.luck / other.luck,
        }
    }
}

impl SubAssign for EntityStats {
    fn sub_assign(&mut self, other: Self) {
        *self = Self {
            strength: self.strength - other.strength,
            endurance: self.endurance - other.endurance,
            dexterity: self.dexterity - other.dexterity,
            intelligence: self.intelligence - other.intelligence,
            vitality: self.vitality - other.vitality,
            magic: self.magic - other.magic,
            luck: self.luck - other.luck,
        }
    }
}
impl AddAssign for EntityStats {
    fn add_assign(&mut self, other: Self) {
        *self = Self {
            strength: self.strength + other.strength,
            endurance: self.endurance + other.endurance,
            dexterity: self.dexterity + other.dexterity,
            intelligence: self.intelligence + other.intelligence,
            vitality: self.vitality + other.vitality,
            magic: self.magic + other.magic,
            luck: self.luck + other.luck,
        }
    }
}

impl Add for EntityStats {
    type Output = Self;

    fn add(self, other: Self) -> Self {
        Self {
            strength: self.strength + other.strength,
            endurance: self.endurance + other.endurance,
            dexterity: self.dexterity + other.dexterity,
            intelligence: self.intelligence + other.intelligence,
            vitality: self.vitality + other.vitality,
            magic: self.magic + other.magic,
            luck: self.luck + other.luck,
        }
    }
}

#[derive(Debug)]
struct EffectChain {
    chain: Vec<EffectModifier>,
}

impl EffectChain {
    fn consume_chain(self) -> EffectModifier {
        let mut sum = EffectModifier::default();
        for effect_modifer in self.chain.into_iter() {
            sum += effect_modifer;
        }

        sum
    }

    fn random_effect_chain(level: usize) -> Self {
        let all_effects = EffectModifier::all_effects();
        let mut chain = Vec::new();
        let chain_size = level * 5; //this should be a bit lower than the actual stat count
        for _ in 0..chain_size {
            let rand_effect_idx = rand::random_range(0..all_effects.len());
            chain.push(all_effects[rand_effect_idx].clone());
        }

        EffectChain { chain }
    }
}

#[derive(Debug, Serialize)]
struct ItemList {
    items: Vec<Item>,
}

impl ItemList {
    fn push(&mut self, item: Item) {
        self.items.push(item);
    }

    fn calc_avg_item(&self) -> Item {
        let mut sum_item = Item::default();
        // apply_scalar(&mut self, scalar: f32)
        let item_count = self.items.len();

        for item in self.items.iter() {
            sum_item += item.clone();
        }

        sum_item.apply_scalar(1.0 / item_count as f32)
    }

    fn calc_std_dev_item(&self, avg_item: &Item) -> Item {
        let mut sum_item = Item::default();

        let item_count = self.items.len();
        for item in self.items.iter() {
            let mut item = item.clone();
            item -= avg_item.clone();
            sum_item += item.apply_square();
        }

        sum_item
            .apply_scalar(1.0 / item_count as f32)
            .apply_square_root()
    }

    fn calc_zscores(&mut self, avg_item: &Item, std_dev_item: &Item) {
        let avg = avg_item.total_zscore();
        let std_dev = std_dev_item.total_zscore();
        let mut min = f32::MAX;
        let mut max = f32::MIN;

        for item in self.items.iter_mut() {
            let score = item.clone().apply_zscore(avg, std_dev);
            if score < min {
                min = score;
            }
            if score > max {
                max = score;
            }
            item.norm_score = score;
        }
        for item in self.items.iter_mut() {
            item.norm_score = normalize(item.norm_score, min, max);
        }
    }

    fn calc_prices(&mut self, max_price: usize) {
        for item in self.items.iter_mut() {
            item.price = (max_price as f32 * item.norm_score) as usize;
        }
    }

    fn gen_list(max_level: usize, item_count: usize) -> Self {
        let per_lvl_count = item_count / max_level;
        let mut item_list = ItemList::default();

        for level in 1..max_level {
            let mut tmp_level_list = Self::default();
            for _ in 0..per_lvl_count {
                let mut item = EffectChain::random_effect_chain(level)
                    .consume_chain()
                    .into_item(level);
                item.rand_category();

                tmp_level_list.push(item);
            }
            let avg_item = tmp_level_list.calc_avg_item();
            let std_dev_item = tmp_level_list.calc_std_dev_item(&avg_item);
            let avg = avg_item.total_zscore();
            let std_dev = std_dev_item.total_zscore();
            let mut max = f32::MIN;
            let mut min = f32::MAX;
            for item in tmp_level_list.items.iter_mut() {
                let score = item.clone().apply_zscore(avg, std_dev);
                if score < min {
                    min = score;
                }
                if score > max {
                    max = score;
                }
                item.lvl_norm_score = score;
            }
            for item in tmp_level_list.items.iter_mut() {
                item.lvl_norm_score = normalize(item.lvl_norm_score, min, max);
            }
            item_list.items.append(&mut tmp_level_list.items);
        }

        item_list
    }
}

impl Default for ItemList {
    fn default() -> Self {
        Self { items: Vec::new() }
    }
}

#[derive(Clone, Debug, Serialize)]
struct Item {
    item_category: String,
    required_skills: EntityStats,
    effects: ItemStats,
    level: usize,
    norm_score: f32,
    lvl_norm_score: f32,
    price: usize,
}

impl Item {
    fn total_zscore(&self) -> f32 {
        self.effects.total_zscore()
    }
    fn apply_zscore(self, avg: f32, std_dev: f32) -> f32 {
        let score = self.total_zscore();
        (score - avg) / std_dev
    }
    const fn categories() -> [&'static str; 14] {
        [
            "sword",
            "spear",
            "mace",
            "club",
            "staff",
            "shield",
            "helmet",
            "gloves",
            "chestplate",
            "belt",
            "pants",
            "boots",
            "ring",
            "knecklace",
        ]
    }

    fn rand_category(&mut self) {
        let rand_idx = rand::random_range(0..Self::categories().len());
        self.item_category = Self::categories()[rand_idx].to_string();
    }
}

impl Rootable for Item {
    fn apply_square_root(self) -> Self {
        Self {
            item_category: self.item_category,
            required_skills: self.required_skills.apply_square_root(),
            effects: self.effects.apply_square_root(),
            level: (self.level as f32).sqrt() as usize,
            norm_score: self.norm_score.sqrt(),
            lvl_norm_score: self.lvl_norm_score.sqrt(),
            price: (self.price as f32).sqrt() as usize,
        }
    }
}

impl Squarable for Item {
    fn apply_square(self) -> Self {
        Self {
            item_category: self.item_category,
            required_skills: self.required_skills.apply_square(),
            effects: self.effects.apply_square(),
            level: self.level * self.level,
            norm_score: self.norm_score * self.norm_score,
            lvl_norm_score: self.lvl_norm_score * self.lvl_norm_score,
            price: self.price * self.price,
        }
    }
}

impl Scalable for Item {
    fn apply_scalar(self, scalar: f32) -> Self {
        Self {
            item_category: self.item_category,
            required_skills: self.required_skills.apply_scalar(scalar),
            effects: self.effects.apply_scalar(scalar),
            level: self.level * scalar as usize,
            norm_score: self.norm_score * scalar,
            lvl_norm_score: self.lvl_norm_score * scalar,
            price: self.price * scalar as usize,
        }
    }
}

impl DivAssign for Item {
    fn div_assign(&mut self, other: Self) {
        self.required_skills /= other.required_skills;
        self.effects /= other.effects;
        self.level /= other.level;
        self.norm_score /= other.norm_score;
        self.lvl_norm_score /= other.lvl_norm_score;
        self.price /= other.price;
    }
}

impl SubAssign for Item {
    fn sub_assign(&mut self, other: Self) {
        self.required_skills -= other.required_skills;
        self.effects -= other.effects;
        self.level -= other.level;
        self.norm_score -= other.norm_score;
        self.lvl_norm_score -= other.lvl_norm_score;
        self.price -= other.price;
    }
}

impl AddAssign for Item {
    fn add_assign(&mut self, other: Self) {
        self.required_skills += other.required_skills;
        self.effects += other.effects;
        self.level += other.level;
        self.norm_score += other.norm_score;
        self.lvl_norm_score += other.lvl_norm_score;
        self.price += other.price;
    }
}

impl Default for Item {
    fn default() -> Self {
        Self {
            item_category: String::new(),
            required_skills: EntityStats::default(),
            effects: ItemStats::default(),
            level: 0,
            norm_score: 0.0,
            lvl_norm_score: 0.0,
            price: 0,
        }
    }
}

#[derive(Clone, Debug)]
struct EffectModifier {
    cost: EntityStats,
    benefit: ItemStats,
    multiplyer: f32,
}

impl EffectModifier {
    single_stat!(plus_1_attack, strength, 1, attack, 1.0);
    single_stat!(plus_1_defense, endurance, 1, defence, 1.0);
    single_stat!(plus_p1_knockback, strength, 1, knockback, 0.1);
    single_stat!(plus_p1_rate_of_attack, dexterity, 1, rate_of_attack, 0.1);
    single_stat!(plus_p1_range, dexterity, 1, range, 0.1);
    single_stat!(plus_p01_crit_chance, luck, 1, critical_chance, 0.01);
    single_stat!(plus_p1_crit_scalar, strength, 1, critical_scalar, 0.1);
    single_stat!(plus_p01_luck, luck, 1, item_luck, 0.01);

    single_stat!(plus_10_mana, magic, 1, mana_added, 10.0);
    regen_modifier!(plus_p1_mana_regen, magic, 1, mana_regen, 0.1);
    consumption_modifier!(plus_p1_mana_consumption, mana_consumption, 0.1);

    single_stat!(plus_10_stamina, endurance, 1, stamina_added, 10.0);
    regen_modifier!(plus_p1_stamina_regen, endurance, 1, stamina_regen, 0.1);
    consumption_modifier!(plus_p1_stamina_consumption, stamina_consumption, 0.1);

    single_stat!(plus_10_health, vitality, 1, health_added, 10.0);
    regen_modifier!(plus_p1_health_regen, vitality, 1, health_regen, 0.1);
    consumption_modifier!(plus_p1_health_consumption, health_consumption, 0.1);
    single_stat!(
        plus_p01_character_speed,
        endurance,
        1,
        character_speed,
        0.01
    );

    fn all_effects() -> [EffectModifier; 18] {
        [
            Self::plus_1_attack(),
            Self::plus_1_defense(),
            Self::plus_p1_knockback(),
            Self::plus_p1_rate_of_attack(),
            Self::plus_p1_range(),
            Self::plus_p01_crit_chance(),
            Self::plus_p1_crit_scalar(),
            Self::plus_p01_luck(),
            Self::plus_10_mana(),
            Self::plus_p1_mana_regen(),
            Self::plus_p1_mana_consumption(),
            Self::plus_10_stamina(),
            Self::plus_p1_stamina_regen(),
            Self::plus_p1_stamina_consumption(),
            Self::plus_10_health(),
            Self::plus_p1_health_regen(),
            Self::plus_p1_health_consumption(),
            Self::plus_p01_character_speed(),
        ]
    }

    fn into_item(self, level: usize) -> Item {
        Item {
            item_category: String::new(),
            required_skills: self.cost,
            effects: self.benefit,
            level,
            norm_score: 0.0,
            lvl_norm_score: 0.0,
            price: 0,
        }
    }
}

impl Default for EffectModifier {
    fn default() -> Self {
        Self {
            cost: EntityStats::default(),
            benefit: ItemStats::default(),
            multiplyer: 1.0,
        }
    }
}

impl AddAssign for EffectModifier {
    fn add_assign(&mut self, other: Self) {
        let new_multiplyer = other.benefit.calc_multiplyer();
        let old_multiplyer = self.multiplyer;
        self.multiplyer = new_multiplyer;
        self.cost += other.cost;
        self.benefit += other.benefit.apply_scalar(old_multiplyer);
    }
}

#[derive(Clone, Debug, Serialize)]
struct ItemStats {
    attack: f32,
    defence: f32,
    knockback: f32,
    rate_of_attack: f32,
    range: f32,

    critical_chance: f32,
    critical_scalar: f32,
    item_luck: f32,

    mana_added: f32,
    mana_regen: f32,
    mana_consumption: f32,

    stamina_added: f32,
    stamina_regen: f32,
    stamina_consumption: f32,

    health_added: f32,
    health_regen: f32,
    health_consumption: f32,

    character_speed: f32,
}

impl Rootable for ItemStats {
    fn apply_square_root(self) -> Self {
        Self {
            attack: self.attack.sqrt(),
            defence: self.defence.sqrt(),
            knockback: self.knockback.sqrt(),
            rate_of_attack: self.rate_of_attack.sqrt(),
            range: self.range.sqrt(),

            critical_chance: self.critical_chance.sqrt(),
            critical_scalar: self.critical_scalar.sqrt(),
            item_luck: self.item_luck.sqrt(),

            mana_added: self.mana_added.sqrt(),
            mana_regen: self.mana_regen.sqrt(),
            mana_consumption: self.mana_consumption.sqrt(),

            stamina_added: self.stamina_added.sqrt(),
            stamina_regen: self.stamina_regen.sqrt(),
            stamina_consumption: self.stamina_consumption.sqrt(),

            health_added: self.health_added.sqrt(),
            health_regen: self.health_regen.sqrt(),
            health_consumption: self.health_consumption.sqrt(),

            character_speed: self.character_speed.sqrt(),
        }
    }
}

impl Squarable for ItemStats {
    fn apply_square(self) -> Self {
        Self {
            attack: self.attack * self.attack,
            defence: self.defence * self.defence,
            knockback: self.knockback * self.knockback,
            rate_of_attack: self.rate_of_attack * self.rate_of_attack,
            range: self.range * self.range,

            critical_chance: self.critical_chance * self.critical_chance,
            critical_scalar: self.critical_scalar * self.critical_scalar,
            item_luck: self.item_luck * self.item_luck,

            mana_added: self.mana_added * self.mana_added,
            mana_regen: self.mana_regen * self.mana_regen,
            mana_consumption: self.mana_consumption * self.mana_consumption,

            stamina_added: self.stamina_added * self.stamina_added,
            stamina_regen: self.stamina_regen * self.stamina_regen,
            stamina_consumption: self.stamina_consumption * self.stamina_consumption,

            health_added: self.health_added * self.health_added,
            health_regen: self.health_regen * self.health_regen,
            health_consumption: self.health_consumption * self.health_consumption,

            character_speed: self.character_speed * self.character_speed,
        }
    }
}

impl Scalable for ItemStats {
    fn apply_scalar(self, scalar: f32) -> Self {
        Self {
            attack: self.attack * scalar,
            defence: self.defence * scalar,
            knockback: self.knockback * scalar,
            rate_of_attack: self.rate_of_attack * scalar,
            range: self.range * scalar,

            critical_chance: self.critical_chance * scalar,
            critical_scalar: self.critical_scalar * scalar,
            item_luck: self.item_luck * scalar,

            mana_added: self.mana_added * scalar,
            mana_regen: self.mana_regen * scalar,
            mana_consumption: self.mana_consumption * scalar,

            stamina_added: self.stamina_added * scalar,
            stamina_regen: self.stamina_regen * scalar,
            stamina_consumption: self.stamina_consumption * scalar,

            health_added: self.health_added * scalar,
            health_regen: self.health_regen * scalar,
            health_consumption: self.health_consumption * scalar,

            character_speed: self.character_speed * scalar,
        }
    }
}
impl Default for ItemStats {
    fn default() -> Self {
        Self {
            attack: 0.0,
            defence: 0.0,
            knockback: 0.0,
            rate_of_attack: 0.0,
            range: 0.0,

            critical_chance: 0.0,
            critical_scalar: 0.0,
            item_luck: 0.0,

            mana_added: 0.0,
            mana_regen: 0.0,
            mana_consumption: 0.0,

            stamina_added: 0.0,
            stamina_regen: 0.0,
            stamina_consumption: 0.0,

            health_added: 0.0,
            health_regen: 0.0,
            health_consumption: 0.0,

            character_speed: 0.0,
        }
    }
}

impl ItemStats {
    single_stat!(attack, f32);
    single_stat!(defence, f32);
    single_stat!(knockback, f32);
    single_stat!(rate_of_attack, f32);
    single_stat!(range, f32);

    single_stat!(critical_chance, f32);
    single_stat!(critical_scalar, f32);
    single_stat!(item_luck, f32);

    single_stat!(mana_added, f32);
    single_stat!(mana_regen, f32);
    single_stat!(mana_consumption, f32);

    single_stat!(stamina_added, f32);
    single_stat!(stamina_regen, f32);
    single_stat!(stamina_consumption, f32);

    single_stat!(health_added, f32);
    single_stat!(health_regen, f32);
    single_stat!(health_consumption, f32);

    single_stat!(character_speed, f32);

    fn calc_multiplyer(&self) -> f32 {
        let mut multiplyer = 1.0;

        if self.health_consumption > 0.0 {
            multiplyer += (self.health_consumption * 10.0) * 2.0; //higher risk, so double the reward
        }

        if self.stamina_consumption > 0.0 {
            multiplyer += self.stamina_consumption * 10.0;
        }

        if self.mana_consumption > 0.0 {
            multiplyer += self.mana_consumption * 10.0;
        }

        multiplyer
    }

    fn total_zscore(&self) -> f32 {
        self.attack
            + self.defence
            + self.knockback
            + self.rate_of_attack
            + self.range
            + self.critical_chance
            + self.critical_scalar
            + self.item_luck
            + self.mana_added
            + self.mana_regen
            - self.mana_consumption
            + self.stamina_added
            + self.stamina_regen
            - self.stamina_consumption
            + self.health_added
            + self.health_regen
            - self.health_consumption
            + self.character_speed
    }
}
impl DivAssign for ItemStats {
    fn div_assign(&mut self, other: Self) {
        *self = Self {
            attack: self.attack / other.attack,
            defence: self.defence / other.defence,
            knockback: self.knockback / other.knockback,
            rate_of_attack: self.rate_of_attack / other.rate_of_attack,
            range: self.range / other.range,

            critical_chance: self.critical_chance / other.critical_chance,
            critical_scalar: self.critical_scalar / other.critical_scalar,
            item_luck: self.item_luck / other.item_luck,

            mana_added: self.mana_added / other.mana_added,
            mana_regen: self.mana_regen / other.mana_regen,
            mana_consumption: self.mana_consumption / other.mana_consumption,

            stamina_added: self.stamina_added / other.stamina_added,
            stamina_regen: self.stamina_regen / other.stamina_regen,
            stamina_consumption: self.stamina_consumption / other.stamina_consumption,

            health_added: self.health_added / other.health_added,
            health_regen: self.health_regen / other.health_regen,
            health_consumption: self.health_consumption / other.health_consumption,

            character_speed: self.character_speed / other.character_speed,
        }
    }
}

impl SubAssign for ItemStats {
    fn sub_assign(&mut self, other: Self) {
        *self = Self {
            attack: self.attack + other.attack,
            defence: self.defence + other.defence,
            knockback: self.knockback + other.knockback,
            rate_of_attack: self.rate_of_attack + other.rate_of_attack,
            range: self.range + other.range,

            critical_chance: self.critical_chance + other.critical_chance,
            critical_scalar: self.critical_scalar + other.critical_scalar,
            item_luck: self.item_luck + other.item_luck,

            mana_added: self.mana_added + other.mana_added,
            mana_regen: self.mana_regen + other.mana_regen,
            mana_consumption: self.mana_consumption + other.mana_consumption,

            stamina_added: self.stamina_added + other.stamina_added,
            stamina_regen: self.stamina_regen + other.stamina_regen,
            stamina_consumption: self.stamina_consumption + other.stamina_consumption,

            health_added: self.health_added + other.health_added,
            health_regen: self.health_regen + other.health_regen,
            health_consumption: self.health_consumption + other.health_consumption,

            character_speed: self.character_speed + other.character_speed,
        }
    }
}
impl AddAssign for ItemStats {
    fn add_assign(&mut self, other: Self) {
        *self = Self {
            attack: self.attack + other.attack,
            defence: self.defence + other.defence,
            knockback: self.knockback + other.knockback,
            rate_of_attack: self.rate_of_attack + other.rate_of_attack,
            range: self.range + other.range,

            critical_chance: self.critical_chance + other.critical_chance,
            critical_scalar: self.critical_scalar + other.critical_scalar,
            item_luck: self.item_luck + other.item_luck,

            mana_added: self.mana_added + other.mana_added,
            mana_regen: self.mana_regen + other.mana_regen,
            mana_consumption: self.mana_consumption + other.mana_consumption,

            stamina_added: self.stamina_added + other.stamina_added,
            stamina_regen: self.stamina_regen + other.stamina_regen,
            stamina_consumption: self.stamina_consumption + other.stamina_consumption,

            health_added: self.health_added + other.health_added,
            health_regen: self.health_regen + other.health_regen,
            health_consumption: self.health_consumption + other.health_consumption,

            character_speed: self.character_speed + other.character_speed,
        };
    }
}

impl Add for ItemStats {
    type Output = Self;

    fn add(self, other: Self) -> Self {
        Self {
            attack: self.attack + other.attack,
            defence: self.defence + other.defence,
            knockback: self.knockback + other.knockback,
            rate_of_attack: self.rate_of_attack + other.rate_of_attack,
            range: self.range + other.range,

            critical_chance: self.critical_chance + other.critical_chance,
            critical_scalar: self.critical_scalar + other.critical_scalar,
            item_luck: self.item_luck + other.item_luck,

            mana_added: self.mana_added + other.mana_added,
            mana_regen: self.mana_regen + other.mana_regen,
            mana_consumption: self.mana_consumption + other.mana_consumption,

            stamina_added: self.stamina_added + other.stamina_added,
            stamina_regen: self.stamina_regen + other.stamina_regen,
            stamina_consumption: self.stamina_consumption + other.stamina_consumption,

            health_added: self.health_added + other.health_added,
            health_regen: self.health_regen + other.health_regen,
            health_consumption: self.health_consumption + other.health_consumption,

            character_speed: self.character_speed + other.character_speed,
        }
    }
}

fn main() {
    let mut item_list = ItemList::gen_list(10, 1000);
    let avg_item = item_list.calc_avg_item();
    let std_dev_item = item_list.calc_std_dev_item(&avg_item);
    item_list.calc_zscores(&avg_item, &std_dev_item);
    item_list.calc_prices(10000);

    println!("{}", serde_json::to_string_pretty(&item_list).unwrap());
}
