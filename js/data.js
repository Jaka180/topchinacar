// ============ DATA ============
// entity：group 为集团/投资组合归属；parent 为已核实的公司母体（可能经中间公司持有）。
// listed 只列本条目对应公司自身的上市证券，不借用母公司代码；jv 不代表品牌。
// null / [] 表示未确认或不适用，并非保证不存在；核实口径与出处见 HANDOFF.md。
const SITE_DATA = {
  brands: [
    {
      id: 'byd', name: 'BYD', cn: '比亚迪', founded: 1995, hq: 'Shenzhen', focus: 'EV / Hybrid',
      entity: {
        "group_en": "BYD Company Limited",
        "group_zh": "比亚迪股份有限公司",
        "listed": [
          {
            "exchange": "SZSE",
            "code": "002594"
          },
          {
            "exchange": "HKEX",
            "code": "01211"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'group',
      colorA: '#d4302a', colorB: '#1a1a1a',
      desc_en: 'A mainstream Chinese auto group transformed by new energy. It combines complete vehicle manufacturing, batteries, electric drives, power semiconductors and global export channels.',
      desc_zh: '中国主流传统整车集团中新能源转型最成功的代表。具备整车制造、电池、电驱、功率半导体与全球出口渠道的垂直整合能力。',
      subBrands_en: 'BYD, Denza, Fang Cheng Bao, Yangwang',
      subBrands_zh: '比亚迪、腾势、方程豹、仰望',
      image: 'images/byd-brand.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0'
    },
    {
      id: 'nio', name: 'NIO', cn: '蔚来', founded: 2014, hq: 'Shanghai', focus: 'Premium EV',
      entity: {
        "group_en": "NIO Inc.",
        "group_zh": "蔚来集团",
        "listed": [
          {
            "exchange": "NYSE",
            "code": "NIO"
          },
          {
            "exchange": "HKEX",
            "code": "09866"
          },
          {
            "exchange": "SGX",
            "code": "NIO"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'startup',
      colorA: '#1d4ed8', colorB: '#0a0a0a',
      desc_en: 'Premium EV with battery-swap network. Europe push via Norway, Germany, Netherlands. Sub-brands Onvo and Firefly target lower segments.',
      desc_zh: '高端电动车，以换电网络著称。已在挪威、德国、荷兰开拓欧洲市场。乐道与萤火虫品牌覆盖中端。',
      image: 'images/nio-brand.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0'
    },
    {
      id: 'xpeng', name: 'Xpeng', cn: '小鹏', founded: 2014, hq: 'Guangzhou', focus: 'Smart EV / ADAS',
      entity: {
        "group_en": "XPeng Inc.",
        "group_zh": "小鹏汽车",
        "listed": [
          {
            "exchange": "NYSE",
            "code": "XPEV"
          },
          {
            "exchange": "HKEX",
            "code": "09868"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'startup',
      colorA: '#22c55e', colorB: '#1a1a1a',
      desc_en: 'Tech-first EV brand with the most advanced city-level autonomous driving in China. Mona and P7+ pushed scale in 2025.',
      desc_zh: '科技优先的电动车品牌，城市智驾领先国内。MONA 与 P7+ 在 2025 年实现规模化。',
      image: 'images/xpeng-brand.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'li', name: 'Li Auto', cn: '理想', founded: 2015, hq: 'Beijing', focus: 'Family EREV / EV',
      entity: {
        "group_en": "Li Auto Inc.",
        "group_zh": "理想汽车",
        "listed": [
          {
            "exchange": "NASDAQ",
            "code": "LI"
          },
          {
            "exchange": "HKEX",
            "code": "02015"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'startup',
      colorA: '#f59e0b', colorB: '#1a1a1a',
      desc_en: 'Family SUV specialist. EREV pioneer with the L-series; MEGA and i-series push pure EV. China\'s most profitable new-energy startup.',
      desc_zh: '家庭 SUV 专家。L 系列开创增程时代，MEGA 与 i 系列拓展纯电。中国最赚钱的新势力车企。',
      image: 'images/liauto-brand.jpg', imageCredit: 'Matti Blume / CC BY-SA'
    },
    {
      id: 'leapmotor', name: 'Leapmotor', cn: '零跑', founded: 2015, hq: 'Hangzhou', focus: 'Value Smart EV',
      entity: {
        "group_en": "Zhejiang Leapmotor Technology Co., Ltd.",
        "group_zh": "浙江零跑科技股份有限公司",
        "listed": [
          {
            "exchange": "HKEX",
            "code": "09863"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": [
          {
            "name_en": "Leapmotor International B.V.",
            "name_zh": "零跑国际",
            "partners": [
              "Stellantis",
              "Leapmotor / 零跑汽车"
            ],
            "stake_note": "Stellantis 51%; Leapmotor 49%. These stakes are in the international JV, not Leapmotor itself. / Stellantis 51%、零跑汽车 49%，比例指零跑国际合资公司，不是零跑汽车本体。"
          }
        ]
      },
      category: 'startup',
      colorA: '#0ea5e9', colorB: '#0a0a0a',
      desc_en: 'Vertically-integrated value EV maker. Stellantis acquired approximately 20% of Leapmotor in 2023. Their separate international joint venture, Leapmotor International, is owned 51% by Stellantis and 49% by Leapmotor.',
      desc_zh: '垂直整合的高性价比新势力。Stellantis 于 2023 年入股零跑汽车约 20%；另设的出海合资公司零跑国际由 Stellantis 持股 51%、零跑汽车持股 49%。',
      image: 'images/leapmotor-c10.webp', imageCredit: 'Stellantis'
    },
    {
      id: 'zeekr', name: 'Zeekr', cn: '极氪', founded: 2021, hq: 'Hangzhou', focus: 'Performance EV',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [],
        "parent_en": "Geely Automobile Holdings Limited",
        "parent_zh": "吉利汽车控股有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Geely', parent_zh: '吉利',
      colorA: '#0ea5e9', colorB: '#0a0a0a',
      desc_en: 'Geely Auto\'s premium EV arm, with the 001 shooting brake, 7X SUV and 009 luxury van. Listed on NYSE in 2024; taken private in December 2025 and now wholly owned by Geely Automobile Holdings.',
      desc_zh: '吉利汽车旗下高端电动品牌，拥有 001 猎装、7X SUV 与 009 豪华 MPV。2024 年于纽交所上市，2025 年 12 月完成私有化，现为吉利汽车控股全资子公司。',
      image: 'images/zeekr-brand.jpg', imageCredit: 'Zoerides / CC BY-SA 4.0'
    },
    {
      id: 'geely', name: 'Geely', cn: '吉利', founded: 1986, hq: 'Hangzhou', focus: 'Multi-brand group',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'group',
      colorA: '#3b82f6', colorB: '#1a1a1a',
      desc_en: 'Zhejiang Geely Holding is a private automotive holding group with investments across Geely Auto, Galaxy, Lynk & Co, Zeekr, Volvo Cars, Polestar and Lotus. It is distinct from Hong Kong-listed Geely Automobile Holdings (0175).',
      desc_zh: '浙江吉利控股是民营汽车控股集团，投资组合覆盖吉利汽车、银河、领克、极氪、沃尔沃汽车、极星与路特斯；它与香港上市公司吉利汽车控股（0175）是不同实体。',
      subBrands_en: 'Geely, Galaxy, Lynk & Co, Zeekr, Volvo, Polestar, Lotus',
      subBrands_zh: '吉利、银河、领克、极氪、沃尔沃、Polestar、路特斯',
      image: 'images/geely-brand.jpg', imageCredit: 'Nissangeniss / CC BY-SA 4.0'
    },
    {
      id: 'chery', name: 'Chery', cn: '奇瑞', founded: 1997, hq: 'Wuhu', focus: 'Mass-market export',
      entity: {
        "group_en": "Chery Automobile Co., Ltd.",
        "group_zh": "奇瑞汽车股份有限公司",
        "listed": [
          {
            "exchange": "HKEX",
            "code": "09973"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": [
          {
            "name_en": "Chery Jaguar Land Rover Automotive Co., Ltd.",
            "name_zh": "奇瑞捷豹路虎汽车有限公司",
            "partners": [
              "Chery Automobile / 奇瑞汽车",
              "Jaguar Land Rover / 捷豹路虎"
            ],
            "stake_note": "Chery Automobile 50%; JLR 50%. / 奇瑞汽车 50%、捷豹路虎 50%。"
          }
        ]
      },
      category: 'group',
      colorA: '#ef4444', colorB: '#1a1a1a',
      desc_en: 'Chery Automobile is an export-led automaker founded in Wuhu in 1997 and listed in Hong Kong (9973) in 2025. Its portfolio includes Chery, Exeed, Jetour, Omoda, Jaecoo and iCar. Chery Holding ceased to hold its shares directly after the January 2025 restructuring.',
      desc_zh: '奇瑞汽车于 1997 年在芜湖成立，2025 年于香港上市（9973），以出口见长，品牌体系涵盖奇瑞、星途、捷途、Omoda、Jaecoo 与 iCar。2025 年 1 月重组后，奇瑞控股已不再直接持有奇瑞汽车股份。',
      subBrands_en: 'Chery, Exeed, Jetour, Omoda, Jaecoo, iCar',
      subBrands_zh: '奇瑞、星途、捷途、Omoda、Jaecoo、iCar',
      image: 'images/chery-brand.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0'
    },
    {
      id: 'changan', name: 'Changan', cn: '长安', founded: 1862, hq: 'Chongqing', focus: 'State automaker / NEV',
      entity: {
        "group_en": "China Changan Automobile Group Co., Ltd.",
        "group_zh": "中国长安汽车集团有限公司",
        "listed": [
          {
            "exchange": "SZSE",
            "code": "000625"
          },
          {
            "exchange": "SZSE",
            "code": "200625"
          }
        ],
        "parent_en": "China Changan Automobile Group Co., Ltd.",
        "parent_zh": "中国长安汽车集团有限公司",
        "jv": [
          {
            "name_en": "Changan Ford Automobile Co., Ltd.",
            "name_zh": "长安福特汽车有限公司",
            "partners": [
              "Changan Automobile / 长安汽车",
              "Ford / 福特"
            ],
            "stake_note": "Changan 50%; Ford 50%. / 长安汽车 50%、福特 50%。"
          },
          {
            "name_en": "Changan Mazda Automobile Co., Ltd.",
            "name_zh": "长安马自达汽车有限公司",
            "partners": [
              "Changan Automobile / 长安汽车",
              "Mazda / 马自达",
              "FAW / 一汽"
            ],
            "stake_note": "Changan 47.5%; Mazda 47.5%; FAW 5%. / 长安汽车 47.5%、马自达 47.5%、一汽 5%。"
          }
        ]
      },
      category: 'group',
      colorA: '#2563eb', colorB: '#111827',
      desc_en: 'Changan Automobile is a Shenzhen-listed automaker under China Changan Automobile Group, which was established in July 2025. Its industrial heritage dates to 1862. Its portfolio includes Changan, Deepal and Nevo/Qiyuan, alongside its investment in Avatr and the Changan Ford and Changan Mazda joint ventures.',
      desc_zh: '长安汽车是深圳上市车企，隶属 2025 年 7 月成立的中国长安汽车集团，工业历史追溯至 1862 年。旗下有长安、深蓝、启源，并投资阿维塔，另有长安福特、长安马自达等合资企业。',
      subBrands_en: 'Changan, Deepal, Avatr, Nevo/Qiyuan',
      subBrands_zh: '长安、深蓝、阿维塔、启源',
      image: 'images/changan-brand.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'xiaomi', name: 'Xiaomi', cn: '小米', founded: 2021, hq: 'Beijing', focus: 'Smart EV',
      entity: {
        "group_en": "Xiaomi Corporation",
        "group_zh": "小米集团",
        "listed": [],
        "parent_en": "Xiaomi Corporation",
        "parent_zh": "小米集团",
        "jv": []
      },
      colorA: '#f97316', colorB: '#0a0a0a',
      desc_en: 'Phone-maker turned car-maker. SU7 sedan and YU7 SUV ignited global attention with Porsche-rivalling performance at half the price.',
      desc_zh: '手机厂跨界造车。SU7 轿车与 YU7 SUV 以保时捷级性能、半价售价引爆全球关注。',
      category: 'startup',
      image: 'images/xiaomi-brand.jpg', imageCredit: 'Xiaomi'
    },
    {
      id: 'gwm', name: 'Great Wall', cn: '长城', founded: 1984, hq: 'Baoding', focus: 'SUV / Pickup',
      entity: {
        "group_en": "Great Wall Motor Company Limited",
        "group_zh": "长城汽车股份有限公司",
        "listed": [
          {
            "exchange": "SSE",
            "code": "601633"
          },
          {
            "exchange": "HKEX",
            "code": "02333"
          }
        ],
        "parent_en": "Baoding Innovation Great Wall Asset Management Company Limited",
        "parent_zh": "保定创新长城资产管理有限公司",
        "jv": [
          {
            "name_en": "Spotlight Automotive Ltd.",
            "name_zh": "光束汽车有限公司",
            "partners": [
              "Great Wall Motor / 长城汽车",
              "BMW Group / 宝马集团"
            ],
            "stake_note": "GWM 50%; BMW 50%. / 长城汽车 50%、宝马 50%。"
          }
        ]
      },
      category: 'group',
      colorA: '#84cc16', colorB: '#1a1a1a',
      desc_en: 'Pickup, SUV and off-road specialist. Brands include Haval, Wey, Tank, Ora and Great Wall pickups. Australia, Thailand and Brazil are key overseas bases.',
      desc_zh: '皮卡、SUV 与越野车型专家。旗下包括哈弗、魏牌、坦克、欧拉与长城皮卡，澳洲、泰国、巴西是重要海外支点。',
      subBrands_en: 'Haval, Wey, Tank, Ora, Great Wall Pickup',
      subBrands_zh: '哈弗、魏牌、坦克、欧拉、长城皮卡',
      image: 'images/gwm-brand.jpg', imageCredit: 'Throwawayacc222 / CC0'
    },
    {
      id: 'saic', name: 'SAIC', cn: '上汽', founded: 1955, hq: 'Shanghai', focus: 'State automaker',
      entity: {
        "group_en": "SAIC Motor Corporation Limited",
        "group_zh": "上海汽车集团股份有限公司",
        "listed": [
          {
            "exchange": "SSE",
            "code": "600104"
          }
        ],
        "parent_en": "Shanghai Automotive Industry (Group) Co., Ltd.",
        "parent_zh": "上海汽车工业（集团）有限公司",
        "jv": [
          {
            "name_en": "SAIC Volkswagen Automotive Co., Ltd.",
            "name_zh": "上汽大众汽车有限公司",
            "partners": [
              "SAIC Motor / 上汽集团",
              "Volkswagen Group / 大众汽车集团"
            ],
            "stake_note": "SAIC 50%; Volkswagen Group 50%. / 上汽 50%、大众汽车集团 50%。"
          },
          {
            "name_en": "SAIC General Motors Co., Ltd.",
            "name_zh": "上汽通用汽车有限公司",
            "partners": [
              "SAIC Motor / 上汽集团",
              "General Motors / 通用汽车"
            ],
            "stake_note": "SAIC 50%; GM 50%. / 上汽 50%、通用汽车 50%。"
          },
          {
            "name_en": "SAIC-GM-Wuling Automobile Co., Ltd.",
            "name_zh": "上汽通用五菱汽车股份有限公司",
            "partners": [
              "SAIC Motor / 上汽集团",
              "General Motors / 通用汽车",
              "Guangxi Automobile Group / 广西汽车集团"
            ],
            "stake_note": "SAIC 50.1%; GM 44%; Guangxi Automobile Group 5.9%. / 上汽 50.1%、通用汽车 44%、广西汽车集团 5.9%。"
          }
        ]
      },
      category: 'group',
      colorA: '#8b5cf6', colorB: '#1a1a1a',
      desc_en: 'Shanghai state-owned auto group with Roewe, MG, IM Motors, Rising/Feifan and Maxus, plus major joint-venture systems. MG remains its strongest global volume badge.',
      desc_zh: '上海国有整车集团，覆盖荣威、名爵、智己、飞凡与大通，同时拥有上汽大众、上汽通用等合资体系。MG 是其最强海外销量品牌。',
      subBrands_en: 'Roewe, MG, IM Motors, Rising/Feifan, Maxus',
      subBrands_zh: '荣威、名爵、智己、飞凡、大通',
      image: 'images/saic-brand.jpg', imageCredit: 'Oleg Yunakov / CC BY-SA 4.0'
    },
    {
      id: 'faw', name: 'FAW', cn: '一汽', founded: 1953, hq: 'Changchun', focus: 'State automaker',
      entity: {
        "group_en": "China FAW Group Co., Ltd.",
        "group_zh": "中国第一汽车集团有限公司",
        "listed": [],
        "parent_en": null,
        "parent_zh": null,
        "jv": [
          {
            "name_en": "FAW-Volkswagen Automotive Co., Ltd.",
            "name_zh": "一汽大众汽车有限公司",
            "partners": [
              "China FAW / 中国一汽",
              "Volkswagen Group / 大众汽车集团"
            ],
            "stake_note": "FAW 60%; Volkswagen AG 25%; Audi AG 5%; Volkswagen (China) Investment 10%. / 一汽 60%、大众汽车股份公司 25%、奥迪 5%、大众中国投资 10%。"
          },
          {
            "name_en": "FAW Toyota Motor Co., Ltd.",
            "name_zh": "一汽丰田汽车有限公司",
            "partners": [
              "China FAW / 中国一汽",
              "Toyota / 丰田"
            ],
            "stake_note": "FAW 50%; Toyota 50%. An October 2026 framework envisages GAC acquiring FAW's stake; completion is not confirmed. / 一汽 50%、丰田 50%。2026 年 10 月框架协议拟由广汽收购一汽所持股权，尚未确认交割。"
          }
        ]
      },
      category: 'group',
      colorA: '#b91c1c', colorB: '#111827',
      desc_en: 'China\'s original state auto group. Its main systems include Hongqi, Bestune and Jiefang, plus FAW-Volkswagen and FAW-Toyota joint ventures.',
      desc_zh: '中国最早的国有整车集团之一，核心体系包括红旗、奔腾、解放，以及一汽大众、一汽丰田等合资体系。',
      subBrands_en: 'Hongqi, Bestune, Jiefang',
      subBrands_zh: '红旗、奔腾、解放',
      image: 'images/faw-brand.jpg', imageCredit: 'Benlisquare / CC BY-SA 4.0'
    },
    {
      id: 'gac', name: 'GAC', cn: '广汽', founded: 1997, hq: 'Guangzhou', focus: 'State automaker / EV',
      entity: {
        "group_en": "Guangzhou Automobile Group Co., Ltd.",
        "group_zh": "广州汽车集团股份有限公司",
        "listed": [
          {
            "exchange": "SSE",
            "code": "601238"
          },
          {
            "exchange": "HKEX",
            "code": "02238"
          }
        ],
        "parent_en": "Guangzhou Automobile Industry Group Co., Ltd.",
        "parent_zh": "广州汽车工业集团有限公司",
        "jv": [
          {
            "name_en": "GAC Toyota Motor Co., Ltd.",
            "name_zh": "广汽丰田汽车有限公司",
            "partners": [
              "GAC Group / 广汽集团",
              "Toyota / 丰田"
            ],
            "stake_note": "GAC 50%; Toyota side 50%. / 广汽 50%、丰田方合计 50%。"
          },
          {
            "name_en": "GAC Honda Automobile Co., Ltd.",
            "name_zh": "广汽本田汽车有限公司",
            "partners": [
              "GAC Group / 广汽集团",
              "Honda / 本田"
            ],
            "stake_note": "GAC 50%; Honda side 50%. / 广汽 50%、本田方合计 50%。"
          }
        ]
      },
      category: 'group',
      colorA: '#0891b2', colorB: '#111827',
      desc_en: 'Guangzhou-based state auto group with Trumpchi, Aion and Hyptec, plus GAC Toyota and GAC Honda joint ventures. Its NEV strategy is centered on Aion volume and Hyptec premium positioning.',
      desc_zh: '总部位于广州的国有整车集团，覆盖广汽传祺、埃安与昊铂，另有广汽丰田、广汽本田等合资企业。新能源战略以埃安规模化和昊铂高端化为核心。',
      subBrands_en: 'Trumpchi, Aion, Hyptec',
      subBrands_zh: '广汽传祺、埃安、昊铂',
      image: 'images/gac-brand.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0'
    },
    {
      id: 'dongfeng', name: 'Dongfeng', cn: '东风', founded: 1969, hq: 'Wuhan', focus: 'State automaker',
      entity: {
        "group_en": "Dongfeng Motor Corporation",
        "group_zh": "东风汽车集团有限公司",
        "listed": [],
        "parent_en": null,
        "parent_zh": null,
        "jv": [
          {
            "name_en": "Dongfeng Motor Co., Ltd.",
            "name_zh": "东风汽车有限公司",
            "partners": [
              "Dongfeng / 东风",
              "Nissan / 日产"
            ],
            "stake_note": "Dongfeng 50%; Nissan 50%. Dongfeng Nissan is its passenger-vehicle business. / 东风 50%、日产 50%；东风日产是其乘用车业务。"
          },
          {
            "name_en": "Dongfeng Honda Automobile Co., Ltd.",
            "name_zh": "东风本田汽车有限公司",
            "partners": [
              "Dongfeng / 东风",
              "Honda / 本田"
            ],
            "stake_note": "Dongfeng 50%; Honda Motor 40%; Honda Motor (China) Investment 10%. / 东风 50%、本田技研 40%、本田中国投资 10%。"
          }
        ]
      },
      category: 'group',
      colorA: '#06b6d4', colorB: '#1a1a1a',
      desc_en: 'State auto group with Dongfeng, Voyah, M-Hero, Forthing, eπ, Nammi and Aeolus, plus Dongfeng Nissan and Dongfeng Honda joint ventures.',
      desc_zh: '国有整车集团，覆盖东风、岚图、猛士、风行、奕派、纳米、风神，并拥有东风日产、东风本田等合资体系。',
      subBrands_en: 'Dongfeng, Voyah, M-Hero, Forthing, eπ, Nammi, Aeolus',
      subBrands_zh: '东风、岚图、猛士、风行、奕派、纳米、风神',
      image: 'images/dongfeng-brand.jpg', imageCredit: 'Kevauto / CC BY-SA 4.0'
    },
    {
      id: 'baic', name: 'BAIC', cn: '北汽', founded: 1958, hq: 'Beijing', focus: 'State automaker',
      entity: {
        "group_en": "BAIC Group",
        "group_zh": "北京汽车集团有限公司",
        "listed": [],
        "parent_en": null,
        "parent_zh": null,
        "jv": [
          {
            "name_en": "Beijing Benz Automotive Co., Ltd.",
            "name_zh": "北京奔驰汽车有限公司",
            "partners": [
              "BAIC Motor / 北京汽车股份",
              "Mercedes-Benz Group / 梅赛德斯-奔驰集团"
            ],
            "stake_note": "BAIC Motor 51%; Mercedes-Benz side 49%. The Chinese shareholder is BAIC Motor, not BAIC Group directly. / 北京汽车股份 51%、奔驰方合计 49%，中方持股主体为北京汽车股份，并非北汽集团直接持有。"
          },
          {
            "name_en": "Beijing Hyundai Motor Co., Ltd.",
            "name_zh": "北京现代汽车有限公司",
            "partners": [
              "BAIC Investment / 北汽投",
              "Hyundai Motor / 现代汽车"
            ],
            "stake_note": "BAIC Investment (a BAIC Motor subsidiary) 50%; Hyundai Motor 50%. / 北京汽车股份旗下北汽投 50%、现代汽车 50%。"
          }
        ]
      },
      category: 'group',
      colorA: '#475569', colorB: '#111827',
      desc_en: 'Beijing state-owned auto group with Beijing Auto, Arcfox and Foton, plus Beijing Benz and Beijing Hyundai joint ventures held through BAIC Motor. BAIC Group and Hong Kong-listed BAIC Motor (1958) are distinct entities.',
      desc_zh: '北京国有整车集团，覆盖北京汽车、极狐与福田，并通过北京汽车股份参与北京奔驰、北京现代等合资企业。北汽集团与香港上市的北京汽车股份（1958）是不同实体。',
      subBrands_en: 'Beijing Auto, Arcfox, Foton',
      subBrands_zh: '北京汽车、极狐、福田',
      image: 'images/baic-brand.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'haval', name: 'Haval', cn: '哈弗', founded: 2013, hq: 'Baoding', focus: 'SUV',
      entity: {
        "group_en": "Great Wall Motor Company Limited",
        "group_zh": "长城汽车股份有限公司",
        "listed": [],
        "parent_en": "Great Wall Motor Company Limited",
        "parent_zh": "长城汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Great Wall', parent_zh: '长城',
      colorA: '#eab308', colorB: '#1a1a1a',
      desc_en: 'Great Wall\'s mainstream SUV brand. Best-selling Chinese SUV brand globally — H6 is a phenomenon in emerging markets.',
      desc_zh: '长城旗下主流 SUV 品牌。全球销量最高的中国 SUV 品牌——H6 在新兴市场表现现象级。',
      image: 'images/haval-brand.jpg', imageCredit: 'Nord794ub / CC BY-SA 4.0'
    },

    // ===== Geely 旗下 =====
    {
      id: 'lynkco', name: 'Lynk & Co', cn: '领克', founded: 2016, hq: 'Hangzhou', focus: 'Crossover / Coupe',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [],
        "parent_en": "Zhejiang ZEEKR Intelligent Technology Co., Ltd.",
        "parent_zh": "浙江极氪智能科技有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Geely', parent_zh: '吉利',
      colorA: '#0f766e', colorB: '#0a0a0a',
      desc_en: 'Built on shared CMA technology. Since February 2025, Lynk & Co has been owned 51% by Zhejiang Zeekr and 49% by Ningbo Geely; Volvo Cars exited its former stake. The 09 SUV and 03 sedan defined its sharp, urban design language.',
      desc_zh: '采用共享的 CMA 平台技术。2025 年 2 月起由浙江极氪持股 51%、宁波吉利持股 49%，沃尔沃汽车已退出原有持股。09 SUV 与 03 轿车奠定了犀利都市的设计语言。',
      image: 'images/lynkco-09.jpg', imageCredit: 'Lynk & Co'
    },
    {
      id: 'polestar', name: 'Polestar', cn: '极星', founded: 2017, hq: 'Gothenburg', focus: 'Performance EV',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [
          {
            "exchange": "NASDAQ",
            "code": "PSNY"
          }
        ],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'subbrand', parent_en: 'Geely', parent_zh: '吉利',
      colorA: '#475569', colorB: '#0a0a0a',
      desc_en: 'Volvo\'s former tuning house turned standalone Swedish EV brand under Geely. Polestar 2 took on the Model 3; Polestar 4 introduced the rear-screen-instead-of-window cabin.',
      desc_zh: '原沃尔沃高性能部门，现为吉利旗下独立的瑞典电动品牌。Polestar 2 对标 Model 3，Polestar 4 首创以后视摄像头取代后窗。',
      image: 'images/polestar-4.jpg', imageCredit: 'Polestar'
    },
    {
      id: 'volvo', name: 'Volvo', cn: '沃尔沃', founded: 1927, hq: 'Gothenburg', focus: 'Safety / Premium',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [
          {
            "exchange": "NASDAQ Stockholm",
            "code": "VOLCAR B"
          }
        ],
        "parent_en": "Geely Sweden Holdings AB",
        "parent_zh": "吉利瑞典控股有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Geely', parent_zh: '吉利',
      colorA: '#1e3a8a', colorB: '#0a0a0a',
      desc_en: 'Swedish heritage brand owned by Geely since 2010. Pivoting fully electric with the EX90 flagship and the EX30 compact — built in China for global markets.',
      desc_zh: '瑞典传统豪华品牌，2010 年起归属吉利。以 EX90 旗舰与 EX30 紧凑车型全面电动化，在中国生产、销往全球。',
      image: 'images/volvo-ex90.jpg', imageCredit: 'Matti Blume / CC BY-SA'
    },
    {
      id: 'lotus', name: 'Lotus', cn: '路特斯', founded: 1948, hq: 'Hethel', focus: 'Sports / Hyper EV',
      entity: {
        "group_en": "Zhejiang Geely Holding Group",
        "group_zh": "浙江吉利控股集团",
        "listed": [],
        "parent_en": null,
        "parent_zh": null,
        "jv": []
      },
      category: 'subbrand', parent_en: 'Geely', parent_zh: '吉利',
      colorA: '#facc15', colorB: '#0a0a0a',
      desc_en: 'British sports-car legend revived by Geely. The Eletre hyper-SUV and Emeya GT mark the all-electric reinvention; the Evija remains its 2,000 hp halo.',
      desc_zh: '英国跑车传奇，由吉利复兴。Eletre 超级 SUV 与 Emeya GT 代表全电动转型，Evija 仍是 2,000 马力的品牌图腾。',
      image: 'images/lotus-eletre.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0'
    },

    // ===== Great Wall 旗下 =====
    {
      id: 'tank', name: 'Tank', cn: '坦克', founded: 2021, hq: 'Baoding', focus: 'Off-road SUV',
      entity: {
        "group_en": "Great Wall Motor Company Limited",
        "group_zh": "长城汽车股份有限公司",
        "listed": [],
        "parent_en": "Great Wall Motor Company Limited",
        "parent_zh": "长城汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Great Wall', parent_zh: '长城',
      colorA: '#65a30d', colorB: '#1a1a1a',
      desc_en: 'Great Wall\'s off-road sub-brand. The boxy Tank 300, 500 and 700 channel Defender and G-Wagon DNA — and dominate China\'s overlanding boom.',
      desc_zh: '长城旗下硬派越野品牌。坦克 300、500、700 方盒子造型对标卫士与大 G，主导国内越野潮流。',
      image: 'images/tank-500.jpg', imageCredit: 'Matti Blume / CC BY-SA'
    },
    {
      id: 'wey', name: 'Wey', cn: '魏牌', founded: 2016, hq: 'Baoding', focus: 'Premium PHEV',
      entity: {
        "group_en": "Great Wall Motor Company Limited",
        "group_zh": "长城汽车股份有限公司",
        "listed": [],
        "parent_en": "Great Wall Motor Company Limited",
        "parent_zh": "长城汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Great Wall', parent_zh: '长城',
      colorA: '#b45309', colorB: '#1a1a1a',
      desc_en: 'Great Wall\'s premium PHEV brand named after founder Wei Jianjun. The Blue Mountain (Lanshan) flagship targets Li Auto\'s family-SUV territory.',
      desc_zh: '长城旗下高端插混品牌，得名于创始人魏建军。蓝山旗舰直接对标理想 L8，主攻家庭 SUV 市场。',
      image: 'images/wey-lanshan.jpg', imageCredit: 'JustAnotherCarDesigner / CC BY-SA 4.0'
    },
    {
      id: 'ora', name: 'Ora', cn: '欧拉', founded: 2018, hq: 'Baoding', focus: 'Female-focused EV',
      entity: {
        "group_en": "Great Wall Motor Company Limited",
        "group_zh": "长城汽车股份有限公司",
        "listed": [],
        "parent_en": "Great Wall Motor Company Limited",
        "parent_zh": "长城汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Great Wall', parent_zh: '长城',
      colorA: '#ec4899', colorB: '#1a1a1a',
      desc_en: 'Retro-styled compact EV brand from Great Wall, positioned for younger and female drivers. The Good Cat became a viral success in Thailand and Australia.',
      desc_zh: '长城旗下复古风格的紧凑电动车品牌，主打年轻与女性用户。好猫在泰国、澳洲走红出圈。',
      image: 'images/ora-good-cat.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0'
    },

    // ===== BYD 旗下 =====
    {
      id: 'denza', name: 'Denza', cn: '腾势', founded: 2010, hq: 'Shenzhen', focus: 'Premium NEV',
      entity: {
        "group_en": "BYD Company Limited",
        "group_zh": "比亚迪股份有限公司",
        "listed": [],
        "parent_en": "BYD Company Limited",
        "parent_zh": "比亚迪股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'BYD', parent_zh: '比亚迪',
      colorA: '#9333ea', colorB: '#0a0a0a',
      desc_en: 'Originally a BYD–Mercedes joint venture, now fully under BYD. The N7 SUV, D9 luxury MPV and Z9GT shooting brake anchor the premium NEV push.',
      desc_zh: '原为比亚迪与奔驰合资品牌，现完全归属比亚迪。N7 SUV、D9 豪华 MPV 与 Z9GT 猎装锚定高端新能源阵地。',
      image: 'images/denza-z9gt.jpg', imageCredit: 'Calreyn88 / CC BY 4.0'
    },
    {
      id: 'yangwang', name: 'Yangwang', cn: '仰望', founded: 2023, hq: 'Shenzhen', focus: 'Ultra-luxury NEV',
      entity: {
        "group_en": "BYD Company Limited",
        "group_zh": "比亚迪股份有限公司",
        "listed": [],
        "parent_en": "BYD Company Limited",
        "parent_zh": "比亚迪股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'BYD', parent_zh: '比亚迪',
      colorA: '#a16207', colorB: '#0a0a0a',
      desc_en: 'BYD\'s ultra-luxury halo brand. The U8 SUV can tank-turn and float on water; the U9 supercar hits 309 km/h. Quad-motor e4 platform showcases BYD\'s tech ceiling.',
      desc_zh: '比亚迪的超豪华图腾品牌。U8 SUV 可原地掉头与浮水，U9 超跑突破 309 km/h。四电机 e4 平台展示比亚迪技术天花板。',
      image: 'images/yangwang-u8.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'fangchengbao', name: 'Fang Cheng Bao', cn: '方程豹', founded: 2023, hq: 'Shenzhen', focus: 'Adventure SUV',
      entity: {
        "group_en": "BYD Company Limited",
        "group_zh": "比亚迪股份有限公司",
        "listed": [],
        "parent_en": "BYD Company Limited",
        "parent_zh": "比亚迪股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'BYD', parent_zh: '比亚迪',
      colorA: '#16a34a', colorB: '#1a1a1a',
      desc_en: 'BYD\'s personality-driven adventure brand. The boxy Bao 5 and Bao 8 PHEVs sit between Tank and Yangwang — built on the DMO super-hybrid off-road platform.',
      desc_zh: '比亚迪旗下个性化越野品牌。豹 5、豹 8 插混定位于坦克与仰望之间，基于 DMO 超级混动越野平台打造。',
      image: 'images/fangchengbao-5.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },

    // ===== SAIC 旗下 =====
    {
      id: 'mg', name: 'MG', cn: '名爵', founded: 1924, hq: 'Shanghai', focus: 'Global affordable EV',
      entity: {
        "group_en": "SAIC Motor Corporation Limited",
        "group_zh": "上海汽车集团股份有限公司",
        "listed": [],
        "parent_en": "SAIC Motor Corporation Limited",
        "parent_zh": "上海汽车集团股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'SAIC', parent_zh: '上汽',
      colorA: '#dc2626', colorB: '#0a0a0a',
      desc_en: 'British heritage brand acquired by Nanjing Automobile in 2005 and brought under SAIC through the 2007 SAIC–Nanjing integration. Cyberster revives the electric convertible roadster.',
      desc_zh: '英国传统汽车品牌，2005 年由南京汽车收购，2007 年随上汽与南汽整合归入上汽。Cyberster 让敞篷跑车以电动形式重生。',
      image: 'images/mg-cyberster.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0'
    },
    {
      id: 'maxus', name: 'Maxus', cn: '大通', founded: 2011, hq: 'Shanghai', focus: 'Commercial / MPV',
      entity: {
        "group_en": "SAIC Motor Corporation Limited",
        "group_zh": "上海汽车集团股份有限公司",
        "listed": [],
        "parent_en": "SAIC Motor Corporation Limited",
        "parent_zh": "上海汽车集团股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'SAIC', parent_zh: '上汽',
      colorA: '#0891b2', colorB: '#0a0a0a',
      desc_en: 'SAIC\'s commercial-vehicle and MPV arm. The Mifa 9 luxury electric people-mover and electric pickups have made it a major fleet export brand.',
      desc_zh: '上汽旗下商用与 MPV 品牌。Mifa 9 豪华电动 MPV 与电动皮卡使其成为重要的商用车出口品牌。',
      image: 'images/maxus-mifa9.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0'
    },
    {
      id: 'im', name: 'IM Motors', cn: '智己', founded: 2020, hq: 'Shanghai', focus: 'Smart Luxury EV',
      entity: {
        "group_en": "SAIC Motor Corporation Limited",
        "group_zh": "上海汽车集团股份有限公司",
        "listed": [],
        "parent_en": "SAIC Motor Corporation Limited",
        "parent_zh": "上海汽车集团股份有限公司",
        "jv": [
          {
            "name_en": "IM Motors",
            "name_zh": "智己汽车",
            "partners": [
              "SAIC Motor / 上汽集团",
              "Alibaba Group / 阿里巴巴集团",
              "Zhangjiang Hi-Tech / 张江高科"
            ],
            "stake_note": "Founded jointly in 2020; current ownership percentages are not asserted. / 2020 年由三方共同创立，不据此断言当前持股比例。"
          }
        ]
      },
      category: 'subbrand', parent_en: 'SAIC', parent_zh: '上汽',
      colorA: '#0369a1', colorB: '#0a0a0a',
      desc_en: 'A SAIC + Alibaba + Zhangjiang joint venture targeting smart-luxury EVs. The LS6 SUV and L6 sedan with semi-solid-state batteries showcase next-gen tech.',
      desc_zh: '上汽、阿里巴巴与张江高科合资的高端智能电动品牌。LS6 SUV 与搭载半固态电池的 L6 轿车展示下一代技术。',
      image: 'images/im-ls6.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0'
    },

    // ===== Dongfeng 旗下 =====
    {
      id: 'voyah', name: 'Voyah', cn: '岚图', founded: 2018, hq: 'Wuhan', focus: 'Premium NEV',
      entity: {
        "group_en": "Dongfeng Motor Corporation",
        "group_zh": "东风汽车集团有限公司",
        "listed": [
          {
            "exchange": "HKEX",
            "code": "07489"
          }
        ],
        "parent_en": "Dongfeng Motor Corporation",
        "parent_zh": "东风汽车集团有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Dongfeng', parent_zh: '东风',
      colorA: '#7c3aed', colorB: '#0a0a0a',
      desc_en: 'Dongfeng\'s premium new-energy brand. The Free SUV, Dreamer MPV and Zhuiguang sedan compete head-on with NIO and Li Auto in the 300-500k RMB segment.',
      desc_zh: '东风旗下高端新能源品牌。FREE SUV、梦想家 MPV 与追光轿车在 30-50 万元区间与蔚来、理想正面竞争。',
      image: 'images/voyah-free.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'mhero', name: 'M-Hero', cn: '猛士', founded: 2022, hq: 'Wuhan', focus: 'Hardcore off-road',
      entity: {
        "group_en": "Dongfeng Motor Corporation",
        "group_zh": "东风汽车集团有限公司",
        "listed": [],
        "parent_en": "Dongfeng Motor Corporation",
        "parent_zh": "东风汽车集团有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Dongfeng', parent_zh: '东风',
      colorA: '#78350f', colorB: '#1a1a1a',
      desc_en: 'Dongfeng\'s ultra-luxury off-road brand rooted in military vehicle heritage. The M-Hero 917 is a 4-motor 1,088 hp electric Defender-fighter.',
      desc_zh: '东风旗下超豪华越野品牌，源自军车血统。猛士 917 为四电机 1,088 马力电动硬派越野，对标卫士。',
      image: 'images/mhero-917.jpg', imageCredit: 'JustAnotherCarDesigner / CC BY-SA 4.0'
    },

    // ===== Chery 旗下 =====
    {
      id: 'omoda', name: 'Omoda', cn: '欧萌达', founded: 2023, hq: 'Wuhu', focus: 'Global crossover',
      entity: {
        "group_en": "Chery Automobile Co., Ltd.",
        "group_zh": "奇瑞汽车股份有限公司",
        "listed": [],
        "parent_en": "Chery Automobile Co., Ltd.",
        "parent_zh": "奇瑞汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Chery', parent_zh: '奇瑞',
      colorA: '#0d9488', colorB: '#0a0a0a',
      desc_en: 'Chery\'s global-first crossover brand. The Omoda 5 and electric E5 spearhead expansion into the UK, Australia, Latin America and the Middle East.',
      desc_zh: '奇瑞旗下面向全球市场的跨界品牌。Omoda 5 与纯电 E5 主攻英国、澳洲、拉美与中东市场。',
      image: 'images/omoda-e5.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      id: 'jaecoo', name: 'Jaecoo', cn: '捷酷', founded: 2023, hq: 'Wuhu', focus: 'Rugged SUV',
      entity: {
        "group_en": "Chery Automobile Co., Ltd.",
        "group_zh": "奇瑞汽车股份有限公司",
        "listed": [],
        "parent_en": "Chery Automobile Co., Ltd.",
        "parent_zh": "奇瑞汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Chery', parent_zh: '奇瑞',
      colorA: '#365314', colorB: '#0a0a0a',
      desc_en: 'Chery\'s rugged-design SUV brand, a sister to Omoda. The Jaecoo 7 PHEV launched in the UK and Europe with 1,200 km combined range.',
      desc_zh: '奇瑞旗下硬派造型 SUV 品牌，与 Omoda 互为兄弟。Jaecoo 7 插混在英国与欧洲上市，综合续航达 1,200 公里。',
      image: 'images/jaecoo-7.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0'
    },
    {
      id: 'exeed', name: 'Exeed', cn: '星途', founded: 2018, hq: 'Wuhu', focus: 'Premium SUV',
      entity: {
        "group_en": "Chery Automobile Co., Ltd.",
        "group_zh": "奇瑞汽车股份有限公司",
        "listed": [],
        "parent_en": "Chery Automobile Co., Ltd.",
        "parent_zh": "奇瑞汽车股份有限公司",
        "jv": []
      },
      category: 'subbrand', parent_en: 'Chery', parent_zh: '奇瑞',
      colorA: '#be123c', colorB: '#0a0a0a',
      desc_en: 'Chery\'s premium SUV brand. The Exeed VX flagship and Yaoguang/Lanyue line aim upmarket with E0X EV platform and Huawei smart-cabin integration.',
      desc_zh: '奇瑞旗下高端 SUV 品牌。星途 VX 旗舰与瑶光、揽月系列基于 E0X 平台、搭载华为座舱冲击高端市场。',
      image: 'images/exeed-vx.jpg', imageCredit: 'Retired electrician / CC0'
    }
  ],

  // Note: prices are indicative launch/list prices in the named market ("~" = approximate).
  models: [
    // ---- BYD family ----
    {
      id: 'byd-seal', brand: 'BYD', name: 'Seal',
      tag_en: 'The Tesla Model 3 challenger that\'s winning Europe',
      tag_zh: '正在赢得欧洲市场的特斯拉 Model 3 挑战者',
      range: '550–650 km CLTC', accel: '3.8–7.5 s', price: 'US$24,800', priceLocal: '¥179,800 China',
      specNote_en: 'China-market trim range; export WLTP figures differ by market.',
      specNote_zh: '中国市场配置区间；出口版 WLTP 数据因市场而异。',
      body_en: 'Seal is BYD\'s global mid-size electric sedan and the brand\'s most direct answer to the Tesla Model 3. It matters because BYD uses Seal to prove that its Blade Battery, CTB body integration and Ocean-series design can compete in mainstream export markets, not only in China. Specifications vary sharply between entry rear-drive cars and the all-wheel-drive Performance version, so range, acceleration and price should be read as a trim range rather than one combined configuration.',
      body_zh: '海豹是比亚迪面向全球市场的中型纯电轿车，也是比亚迪对标 Tesla Model 3 最直接的车型。它的重要性在于，比亚迪用海豹证明刀片电池、CTB 电池车身一体化和海洋网设计语言不仅能在中国市场成立，也能进入主流出口市场。入门后驱版与四驱性能版的续航、加速和价格差异很大，因此本页参数按配置区间理解，而不是单一车型配置。',
      colorA: '#d4302a', shape: 'sedan',
      image: 'images/byd-seal.jpg', imageCredit: 'BYD',
      names: { cn: null, overseas: [{ name: 'BYD SEAL', markets: ['Europe', 'Netherlands', 'Australia', 'Thailand', 'Singapore'] }] },
      markets: ['Europe', 'Netherlands', 'Australia', 'Thailand', 'Singapore'],
      price_cn: null,
      range_note: {
        cltc: null,
        wltp: { en: '61.4 kWh rear-wheel drive: 460 km. 82.5 kWh rear-wheel drive: 570 km. All-wheel drive: 520 km. BYD Netherlands price list, May 2026.', zh: '61.4 kWh 后驱 460 km，82.5 kWh 后驱 570 km，四驱 520 km。比亚迪荷兰 2026 年 5 月价格表。' },
        epa: null
      },
      sources: [
        { name: 'BYD Netherlands SEAL price list, May 2026', url: 'https://www.byd.com/material/byd-site/nl/pdfs/pricelist-may-2026/Prijslijst%20BYD%20SEAL%202026%20per%20Mei%202026%20-%20V1.0.pdf' },
        { name: 'BYD Europe: DOLPHIN and SEAL introduction, 14 April 2023', url: 'https://www.byd.com/eu/news-list/BYD_Introduces_Two_New_Full-electric_Vehicles_in_Europe_BYD_DOLPHIN_and_BYD_SEAL.html' },
        { name: 'BYD Australia: SEAL', url: 'https://bydautomotive.com.au/seal' },
        { name: 'BYD Thailand: SEAL', url: 'https://www.byd.com/en-th/car/seal' },
        { name: 'BYD Singapore: order SEAL', url: 'https://www.byd.com/sg/order-seal' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'byd-seagull', brand: 'BYD', name: 'Seagull',
      tag_en: 'The world\'s most disruptive small EV — exported as the Dolphin Mini.',
      tag_zh: '全球最具颠覆性的小型电动车——海外以 Dolphin Mini 之名出口。',
      range: '305–405 km CLTC', accel: '~12–14 s', price: 'US$9,600', priceLocal: '¥69,800 China',
      specNote_en: 'Entry price is for the lower-range trim; 405 km versions cost more.',
      specNote_zh: '入门价对应低续航配置；405 km 版本价格更高。',
      body_en: 'Seagull is BYD\'s small EV price weapon, exported in several markets as Dolphin Mini. Its significance is not performance but cost structure: LFP battery chemistry, compact packaging and high-volume manufacturing make it one of the clearest examples of China\'s EV affordability advantage. Buyers should not mix the entry price with the longest-range trim, because the 305 km and 405 km versions sit at different price points.',
      body_zh: '海鸥是比亚迪的小型纯电价格武器，在部分海外市场以 Dolphin Mini 名称销售。它的意义不在性能，而在成本结构：磷酸铁锂电池、紧凑封装与大规模制造，让它成为中国电动车价格优势最清晰的样本之一。阅读参数时不应把入门价与最长续航版本混用，因为 305 km 与 405 km 版本处在不同价格档。',
      colorA: '#0ea5e9', shape: 'suv',
      image: 'images/byd-seagull.jpg', imageCredit: 'User3204 / CC BY-SA 4.0',
      names: { cn: null, overseas: [{ name: 'BYD Dolphin Surf', markets: ['Europe'] }] },
      markets: ['Europe'],
      price_cn: null,
      range_note: {
        cltc: null,
        wltp: { en: 'Europe Dolphin Surf Boost (43.2 kWh): 322 km WLTP combined and 502 km WLTP city. BYD, 30 June 2025. Other trims were not stated in that release.', zh: '欧洲 Dolphin Surf Boost（43.2 kWh）：WLTP 综合 322 km，WLTP 城市 502 km。比亚迪 2025-06-30 新闻稿。该稿未给出其他配置。' },
        epa: null
      },
      sources: [
        { name: 'BYD: millionth Dolphin Surf, 30 June 2025', url: 'https://media.byd.com/byd-celebrates-production-of-millionth-record-breaking-dolphin-surf' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'byd-atto-3', brand: 'BYD', name: 'Atto 3',
      tag_en: 'BYD\'s global bestseller — the compact SUV that opened 70+ export markets.',
      tag_zh: '比亚迪全球出口主力——打开 70 多个海外市场的紧凑型 SUV。',
      range: '430–510 km CLTC', accel: '~7.3 s', price: 'US$16,500', priceLocal: '¥119,800 China',
      specNote_en: 'China-market range differs from WLTP figures used in many export markets.',
      specNote_zh: '中国市场 CLTC 续航与多数出口市场 WLTP 口径不同。',
      body_en: 'Atto 3 is BYD\'s most important global compact SUV and one of the first models that made BYD visible to mainstream buyers outside China. It packages the e-Platform 3.0, Blade Battery and a practical crossover body in a format that works for Europe, Southeast Asia, Australia and Latin America. Export-market battery packs, safety equipment and range ratings can differ from China-market data.',
      body_zh: 'Atto 3 是比亚迪最重要的全球紧凑型 SUV，也是比亚迪最早让海外主流消费者感知到的车型之一。它把 e-Platform 3.0、刀片电池和实用跨界车身整合到适合欧洲、东南亚、澳洲和拉美的产品形态中。出口市场的电池包、安全配置与续航测试标准可能与中国市场不同。',
      colorA: '#d4302a', shape: 'suv',
      image: 'images/byd-atto-3.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0',
      names: {
        cn: 'Yuan Plus',
        overseas: [
          { name: 'BYD Atto 3', markets: ['New Zealand'] },
          { name: 'BYD Atto 5', markets: ['New Zealand'], status: 'planned-next' }
        ]
      },
      markets: ['New Zealand'],
      price_cn: null,
      range_note: null,
      sources: [
        { name: 'Auto Trader NZ: new Yuan Plus confirmed as Atto 5 for 2027, 25 April 2026', url: 'https://autotrader.co.nz/news/exclusive-byds-new-yuan-plus-to-arrive-in-nz-as-atto-5-in-2027' },
        { name: 'electrive: BYD plans overseas Yuan Plus launch as Atto 5, 13 May 2026', url: 'https://www.electrive.com/2026/05/13/byd-plans-to-launch-new-yuan-plus-overseas-as-atto-5/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'byd-sealion-07', brand: 'BYD', name: 'Sealion 07',
      tag_en: 'Ocean-series coupe SUV aimed squarely at the Tesla Model Y.',
      tag_zh: '海洋网轿跑 SUV，直接对标特斯拉 Model Y。',
      range: '550–610 km CLTC', accel: '4.5–7.3 s', price: 'US$26,200', priceLocal: '¥189,800 China',
      specNote_en: 'Performance acceleration belongs to AWD trims; entry pricing is lower-output RWD.',
      specNote_zh: '高性能加速对应四驱配置；入门价为较低功率后驱配置。',
      body_en: 'Sealion 07 is BYD\'s Ocean-series coupe SUV for the Model Y class. It sits above Atto 3 in size and positioning, and is important because it shows BYD moving from price-led export growth into more design- and performance-led segments. The fastest acceleration figure and the entry price belong to different trims, so this page presents the main China-market specification band.',
      body_zh: '海狮 07 是比亚迪海洋网面向 Model Y 级别的轿跑 SUV，尺寸和定位高于 Atto 3。它的重要性在于，比亚迪正在从价格驱动的出口增长，进入更强调设计、性能与中高端定位的细分市场。最快零百加速与入门价格来自不同配置，因此本页以中国市场主要配置区间展示。',
      colorA: '#1d4ed8', shape: 'suv',
      image: 'images/byd-sealion-07.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0',
      names: { cn: '海狮07 EV', overseas: [{ name: 'BYD Sealion 7', markets: ['Europe', 'Belgium'] }] },
      markets: ['Europe', 'Belgium'],
      price_cn: {
        min_cny: 189800,
        max_cny: 239800,
        as_of: null,
        note_en: '2025-model trims still listed as on sale: ¥189,800, ¥199,800, ¥219,800 and ¥239,800. The page does not give an official price date, so none is shown.',
        note_zh: '页面仍标为在售的 2025 款：18.98 万、19.98 万、21.98 万、23.98 万元。页面没有给出官方价格日期，所以不写日期。'
      },
      range_note: {
        cltc: { en: '2025 China trims still listed in 2026: 550 km or 610 km CLTC.', zh: '2025 款在 2026 年仍列出的中国在售配置：CLTC 550 km 或 610 km。' },
        wltp: { en: 'Comfort rear-wheel drive: 482 km. Design all-wheel drive: 456 km. Excellence all-wheel drive: 502 km.', zh: 'Comfort 后驱 482 km，Design 四驱 456 km，Excellence 四驱 502 km。' },
        epa: null
      },
      sources: [
        { name: 'ZOL: 海狮07 EV 2025 trim list', url: 'https://detail.zol.com.cn/car/index2121160.shtml' },
        { name: 'BitAuto Belgium: Sealion 7', url: 'https://www.bitauto.com/zh-be/byd/sealion-7' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'byd-han', brand: 'BYD', name: 'Han',
      tag_en: 'The flagship sedan that proved a Chinese brand could sell above ¥200K.',
      tag_zh: '证明中国品牌能站稳 20 万元以上市场的旗舰轿车。',
      range: '506–715 km CLTC', accel: '3.9–7.9 s', price: 'US$29,000', priceLocal: '¥209,800 China',
      specNote_en: 'Han EV trim range; DM-i/PHEV variants use different powertrain figures.',
      specNote_zh: '此处为汉 EV 配置区间；DM-i/插混版本动力与续航口径不同。',
      body_en: 'Han is BYD\'s flagship sedan family and one of the models that moved the brand above the budget-EV conversation. It combines executive-sedan dimensions with Blade Battery and high-output electric-drive options, while different EV and plug-in-hybrid versions serve different buyers. The figures here refer to the Han EV range and should not be blended with DM-i/PHEV specifications.',
      body_zh: '汉是比亚迪旗舰轿车家族，也是推动比亚迪跳出低价电动车叙事的关键车型之一。它以行政级轿车尺寸结合刀片电池和高功率电驱，不同纯电与插混版本服务不同用户。本页数据指汉 EV 配置区间，不与 DM-i/插混版本参数混用。',
      colorA: '#111827', shape: 'sedan-long',
      image: 'images/byd-han.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: null,
      markets: null,
      price_cn: null,
      range_note: null,
      sources: null,
      powertrain: ['bev']
    },
    {
      id: 'byd-shark-6', brand: 'BYD', name: 'Shark 6',
      tag_en: 'PHEV pickup built for Australia and Latin America — a Hilux fighter.',
      tag_zh: '为澳洲与拉美打造的插混皮卡，直面 Hilux。',
      range: '100 km EV / 800+ km', accel: '5.7 s', price: 'US$38,200', priceLocal: 'A$57,900 AU',
      colorA: '#374151', shape: 'suv',
      image: 'images/byd-shark-6.jpg', imageCredit: 'Ethan Llamas / CC BY-SA 4.0',
      names: { cn: null, overseas: [{ name: 'BYD Shark 6', markets: ['Australia'] }] },
      markets: ['Australia'],
      price_cn: null,
      range_note: null,
      sources: [
        { name: 'CarExpert: 2026 BYD Shark 6 price and specs, 20 April 2026', url: 'https://www.carexpert.com.au/car-news/2026-byd-shark-6-price-and-specs' }
      ],
      powertrain: ['phev']
    },
    // ---- Xiaomi ----
    {
      id: 'xiaomi-su7', brand: 'Xiaomi', name: 'SU7',
      tag_en: 'The phone-maker\'s first car — 700 km of range and a cult following overnight.',
      tag_zh: '手机厂商的第一台车——700 公里续航，一夜之间成为现象级爆款。',
      range: '700 km', accel: '5.28 s', price: 'US$29,800', priceLocal: '¥215,900 China',
      colorA: '#f97316', shape: 'sedan',
      image: 'images/xiaomi-su7.jpg', imageCredit: 'Benlisquare / CC BY-SA 4.0',
      names: { cn: '小米SU7', overseas: [] },
      markets: null,
      price_cn: null,
      range_note: null,
      sources: [
        { name: 'CnEVPost: Xiaomi Auto global site ahead of 2027 Europe entry, 26 August 2026', url: 'https://cnevpost.com/2026/08/26/xiaomi-auto-launches-global-website-social-channels/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'xiaomi-su7-ultra', brand: 'Xiaomi', name: 'SU7 Ultra',
      tag_en: 'Nürburgring-honed sedan with 1,548 hp. The supercar killer.',
      tag_zh: '在纽北赛道调校、1,548 马力的轿车。超跑杀手。',
      range: '630 km', accel: '1.98 s', price: 'US$73,100', priceLocal: '¥529,900 China',
      colorA: '#f97316', shape: 'sedan',
      image: 'images/xiaomi-su7-ultra.jpg',
      imageCredit: 'Daniel Lu (User:dllu) / CC BY-SA 4.0',
      names: { cn: '小米SU7 Ultra', overseas: [] },
      markets: null,
      price_cn: null,
      range_note: null,
      sources: [
        { name: 'CnEVPost: Xiaomi Auto global site ahead of 2027 Europe entry, 26 August 2026', url: 'https://cnevpost.com/2026/08/26/xiaomi-auto-launches-global-website-social-channels/' }
      ],
      powertrain: ['bev']
    },
    // ---- NIO family ----
    {
      id: 'nio-et5', brand: 'NIO', name: 'ET5',
      tag_en: 'The volume NIO — swap-capable compact sedan sold across Europe.',
      tag_zh: '蔚来走量担当——支持换电、已进入欧洲多国的中型轿车。',
      range: '560 km', accel: '4.0 s', price: 'US$41,100', priceLocal: '¥298,000 China',
      colorA: '#1d4ed8', shape: 'sedan',
      image: 'images/nio-et5.jpg', imageCredit: 'conceptphoto.info / CC BY 2.0',
      names: { cn: '蔚来ET5', overseas: [{ name: 'NIO ET5', markets: ['Germany'] }] },
      markets: ['Germany'],
      price_cn: null,
      range_note: {
        cltc: null,
        wltp: { en: 'Standard Range: 456 km WLTP. Long Range: 590 km WLTP. Reported in October 2026 from a German NIO price list.', zh: '标准续航 456 km WLTP，长续航 590 km WLTP。2026 年 10 月报道转述的蔚来德国价格表。' },
        epa: null
      },
      sources: [
        { name: 'Rouleur Électrique: NIO ET5, updated October 2026', url: 'https://rouleur-electrique.fr/nio/et5/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'nio-et9', brand: 'NIO', name: 'ET9',
      tag_en: 'Flagship saloon with 925V architecture and steer-by-wire.',
      tag_zh: '搭载 925V 高压平台与线控转向的旗舰轿车。',
      range: '650 km', accel: '4.3 s', price: 'US$108,700', priceLocal: '¥788,000 China',
      colorA: '#1d4ed8', shape: 'sedan-long',
      image: 'images/nio-et9.jpg', imageCredit: 'S5A-0043 / CC BY 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    {
      id: 'nio-onvo-l60', brand: 'NIO', name: 'Onvo L60',
      tag_en: 'NIO\'s family-SUV sub-brand debut, priced under the Model Y.',
      tag_zh: '蔚来子品牌乐道首款家用 SUV，定价低于 Model Y。',
      range: '555 km', accel: '5.9 s', price: 'US$28,600', priceLocal: '¥206,900 China',
      colorA: '#0ea5e9', shape: 'suv',
      image: 'images/nio-onvo-l60.jpg', imageCredit: 'Tim Wu / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    {
      id: 'nio-firefly', brand: 'NIO', name: 'Firefly',
      tag_en: 'NIO\'s premium small EV for Europe-first expansion.',
      tag_zh: '蔚来面向欧洲市场的高端小车品牌萤火虫。',
      range: '420 km', accel: '~8 s', price: 'US$16,500', priceLocal: '¥119,800 China',
      colorA: '#22c55e', shape: 'suv',
      image: 'images/nio-firefly.jpg', imageCredit: 'Matti Blume / CC BY-SA',
      names: { cn: '萤火虫', overseas: [{ name: 'firefly', markets: [] }] },
      markets: null,
      price_cn: {
        min_cny: 119800,
        max_cny: null,
        as_of: null,
        note_en: 'Vehicle purchase price, not battery lease. The 42 kWh version starts at ¥119,800. The 60 kWh version starts at ¥136,800. A full top price was not stated. The IT之家 article date is not treated as the official price date.',
        note_zh: '整车购买价，不是 BaaS 租电价。42 kWh 版本 11.98 万元起，60 kWh 版本 13.68 万元起。未见顶配封顶价。IT之家的发稿日期不当作官方价格日期。'
      },
      range_note: {
        cltc: { en: '42 kWh: 420 km CLTC. 60 kWh: 560 km CLTC.', zh: '42 kWh：CLTC 420 km。60 kWh：CLTC 560 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: 'IT之家: firefly 60 kWh battery, 23 October 2026', url: 'https://www.ithome.com/1/016/840.htm' }
      ],
      powertrain: ['bev']
    },
    // ---- Xpeng ----
    {
      id: 'xpeng-g6', brand: 'Xpeng', name: 'G6',
      tag_en: 'Coupe-SUV with industry-leading 800V architecture and XNGP city autonomy.',
      tag_zh: '搭载行业领先 800V 高压架构与 XNGP 城市智驾的轿跑 SUV。',
      range: '755 km', accel: '3.9 s', price: 'US$27,600', priceLocal: '¥199,800 China',
      colorA: '#22c55e', shape: 'suv',
      image: 'images/xpeng-g6.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    {
      id: 'xpeng-mona-m03', brand: 'Xpeng', name: 'Mona M03',
      tag_en: 'The sub-¥120K smart sedan that made city-level ADAS affordable.',
      tag_zh: '不到 12 万元的智能轿车，让城市级智驾走进大众市场。',
      range: '515 km', accel: '~7.5 s', price: 'US$16,500', priceLocal: '¥119,800 China',
      colorA: '#22c55e', shape: 'sedan',
      image: 'images/xpeng-mona-m03.jpg', imageCredit: 'S5A-0043 / CC BY 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    // ---- Li Auto ----
    {
      id: 'li-mega', brand: 'Li Auto', name: 'MEGA',
      tag_en: 'Bullet-train MPV. The most polarising design statement of the year.',
      tag_zh: '高铁造型 MPV。今年最具话题性的设计宣言。',
      range: '710 km', accel: '5.5 s', price: 'US$77,300', priceLocal: '¥559,800 China',
      colorA: '#f59e0b', shape: 'mpv',
      image: 'images/liauto-mega.jpg', imageCredit: '4300streetcar / CC BY 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    {
      id: 'li-l6', brand: 'Li Auto', name: 'L6',
      tag_en: 'The five-seat EREV SUV that made Li Auto a volume player.',
      tag_zh: '让理想真正走量的五座增程 SUV。',
      range: '1,390 km (EREV)', accel: '5.4 s', price: 'US$34,500', priceLocal: '¥249,800 China',
      colorA: '#f59e0b', shape: 'suv',
      image: 'images/li-l6.jpg', imageCredit: 'Ethan Llamas / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['erev']
    },
    // ---- Zeekr / Lynk & Co ----
    {
      id: 'zeekr-001', brand: 'Zeekr', name: '001',
      tag_en: 'Performance shooting brake. The Porsche Panamera Sport Turismo at 1/3 the price.',
      tag_zh: '高性能猎装车。三分之一价格的保时捷 Panamera Sport Turismo。',
      range: '750 km', accel: '3.3 s', price: 'US$37,100', priceLocal: '¥269,000 China',
      colorA: '#0ea5e9', shape: 'wagon',
      image: 'images/zeekr-001.jpg', imageCredit: 'Юрий Д.К. / CC BY 4.0',
      names: { cn: null, overseas: [{ name: 'Zeekr 001', markets: ['Italy'] }] },
      markets: ['Italy'],
      price_cn: null,
      range_note: {
        cltc: null,
        wltp: { en: 'Italy, 100 kWh gross: Long Range rear-wheel drive 620 km; Performance all-wheel drive 594 km; Privilege all-wheel drive 585 km WLTP.', zh: '意大利在售、100 kWh（总容量）：Long Range 后驱 WLTP 620 km；Performance 四驱 594 km；Privilege 四驱 585 km。' },
        epa: null
      },
      sources: [
        { name: 'Motor1 Italy: Zeekr 001 prices, 27 May 2026', url: 'https://it.motor1.com/news/796976/zeekr-001-prezzo-allestimenti/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'zeekr-7x', brand: 'Zeekr', name: '7X',
      tag_en: 'Mid-size SUV with 800V and a 10-minute 10–80% charge — Europe-bound.',
      tag_zh: '800V 平台、10 分钟 10–80% 快充的中型 SUV，正进军欧洲。',
      range: '780 km', accel: '3.8 s', price: 'US$31,700', priceLocal: '¥229,900 China',
      colorA: '#0ea5e9', shape: 'suv',
      image: 'images/zeekr-7x.jpg', imageCredit: 'Ethan Llamas / CC BY-SA 4.0',
      names: { cn: '极氪7X', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 229800,
        max_cny: 269800,
        as_of: null,
        note_en: 'Dealer guide-price table collected on 21 October 2026: ¥229,800, ¥249,800 and ¥269,800.',
        note_zh: '2026-10-21 采集的经销商指导价表：22.98 万、24.98 万、26.98 万元。'
      },
      range_note: {
        cltc: { en: '2026 China trims: 75 kWh rear-wheel drive 702 km; 103 kWh rear-wheel drive 802 km; 103 kWh all-wheel drive 702 km CLTC. The 802 km ceiling is also stated by ZOL.', zh: '2026 款中国配置：75 kWh 后驱 CLTC 702 km；103 kWh 后驱 802 km；103 kWh 四驱 702 km。中关村在线也写了最高 802 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: 'ZOL Tianjin Zeekr 7X guide prices, collected 21 October 2026', url: 'https://auto.zol.com.cn/1264/12642140_all.html' },
        { name: 'Sina Auto: Zeekr 7X 2026 prices and CLTC', url: 'https://k.sina.cn/article_7857141524_1d452771401902type.html' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'lynkco-09', brand: 'Lynk & Co', name: '09',
      tag_en: 'Full-size PHEV SUV on Volvo\'s SPA platform — Lynk\'s flagship.',
      tag_zh: '基于沃尔沃 SPA 平台的全尺寸插混 SUV，领克旗舰。',
      range: '150 km EV / 1,400 km', accel: '~6 s', price: '~US$36,700', priceLocal: '¥265,900 China',
      colorA: '#111827', shape: 'suv',
      image: 'images/lynkco-09.jpg', imageCredit: 'Lynk & Co',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['phev']
    },
    // ---- Geely Galaxy ----
    {
      id: 'geely-galaxy-e5', brand: 'Geely', name: 'Galaxy E5',
      tag_en: 'Geely\'s global compact e-SUV — sold as the EX5 in 50+ markets.',
      tag_zh: '吉利全球化紧凑纯电 SUV——海外以 EX5 之名进入 50 多国。',
      range: '530 km', accel: '~7 s', price: 'US$15,200', priceLocal: '¥109,800 China',
      colorA: '#7c3aed', shape: 'suv',
      image: 'images/geely-galaxy-e5.jpg', imageCredit: 'JustAnotherCarDesigner / CC0',
      names: { cn: '银河E5', overseas: [{ name: 'Geely EX5', markets: ['New Zealand'] }] },
      markets: ['New Zealand'],
      price_cn: null,
      range_note: null,
      sources: [
        { name: 'CarExpert New Zealand: 2026 Geely EX5 pricing', url: 'https://www.carexpert.co.nz/geely/ex5/2026/price-and-specs' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'geely-starship-7', brand: 'Geely', name: 'Galaxy Starship 7',
      tag_en: 'Super-hybrid SUV rolling out across 57 countries, Brazil assembly planned.',
      tag_zh: '进入 57 国的超级混动 SUV，计划在巴西本地组装。',
      range: '120 km EV / 1,400+ km', accel: '~8 s', price: 'US$13,800', priceLocal: '¥99,800 China',
      colorA: '#7c3aed', shape: 'suv',
      image: 'images/geely-starship-7.jpg', imageCredit: 'Ethan Llamas / CC BY-SA 4.0',
      names: { cn: '银河星舰7', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: null,
        max_cny: null,
        as_of: null,
        note_en: 'One verified trim only: Youxing official guide price ¥105,800. The full lineup interval was not confirmed.',
        note_zh: '只核实到优行版官方指导价 10.58 万元，全系价格区间未核实。'
      },
      range_note: {
        cltc: { en: 'Youxing trim only: 130 km CLTC electric range with a 19.09 kWh battery. Not a full-lineup figure.', zh: '仅优行版：19.09 kWh 电池，CLTC 纯电 130 km。不是全系数字。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: '车质网 via NetEase: 银河星舰7优行版, 27 October 2026', url: 'https://www.163.com/dy/article/LA83C48D0527D0EQ.html' }
      ],
      powertrain: ['phev']
    },
    // ---- Great Wall family ----
    {
      id: 'haval-h6', brand: 'Haval', name: 'H6',
      tag_en: 'The best-selling Chinese SUV abroad — a fixture from Bangkok to Brasília.',
      tag_zh: '海外销量第一的中国 SUV——从曼谷到巴西利亚随处可见。',
      range: 'ICE · HEV · PHEV', accel: '~8 s', price: 'US$13,600', priceLocal: '¥98,900 China',
      colorA: '#374151', shape: 'suv',
      image: 'images/haval-brand.jpg', imageCredit: 'Nord794ub / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['ice', 'hev', 'phev']
    },
    {
      id: 'tank-300', brand: 'Tank', name: '300',
      tag_en: 'The retro off-roader that started China\'s overlanding boom.',
      tag_zh: '掀起中国越野热潮的复古硬派 SUV。',
      range: 'ICE · Hi4-T PHEV', accel: '~9 s', price: 'US$27,600', priceLocal: '¥199,800 China',
      colorA: '#374151', shape: 'suv',
      image: 'images/tank-300.jpg', imageCredit: 'Jengtingchen / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['ice', 'phev']
    },
    {
      id: 'ora-good-cat', brand: 'Ora', name: 'Good Cat',
      tag_en: 'Retro-styled compact EV — a viral hit in Thailand and Australia.',
      tag_zh: '复古造型小车，在泰国与澳洲成为爆款。',
      range: '501 km', accel: '~8.5 s', price: '~US$14,300', priceLocal: '¥103,900 China',
      colorA: '#22c55e', shape: 'suv',
      image: 'images/ora-good-cat.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0',
      names: null,
      markets: null,
      price_cn: null,
      range_note: null,
      sources: null,
      powertrain: ['bev']
    },
    {
      id: 'wey-lanshan', brand: 'Wey', name: 'Blue Mountain',
      tag_en: 'Great Wall\'s premium PHEV flagship, gunning for Li Auto\'s family crown.',
      tag_zh: '长城高端插混旗舰蓝山，直指理想的家庭市场。',
      range: '180 km EV / 1,200 km', accel: '4.9 s', price: 'US$37,800', priceLocal: '¥273,800 China',
      colorA: '#111827', shape: 'suv',
      image: 'images/wey-lanshan.jpg', imageCredit: 'JustAnotherCarDesigner / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['phev']
    },
    // ---- SAIC family ----
    {
      id: 'mg-mg4', brand: 'MG', name: 'MG4 EV',
      tag_en: 'Europe\'s best-selling Chinese EV — rear-drive, honest, affordable.',
      tag_zh: '欧洲最畅销的中国电动车——后驱、扎实、亲民。',
      range: '450 km (WLTP)', accel: '7.7 s', price: 'US$34,600', priceLocal: '£26,995 UK',
      colorA: '#d4302a', shape: 'suv',
      image: 'images/mg-mg4.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    {
      id: 'mg-cyberster', brand: 'MG', name: 'Cyberster',
      tag_en: 'The electric roadster reviving MG\'s British sports-car soul.',
      tag_zh: '复活 MG 英伦跑车之魂的电动敞篷。',
      range: '580 km', accel: '3.2 s', price: 'US$44,100', priceLocal: '¥319,800 China',
      colorA: '#d4302a', shape: 'sedan',
      image: 'images/mg-cyberster.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    {
      id: 'maxus-mifa-9', brand: 'Maxus', name: 'Mifa 9',
      tag_en: 'Luxury electric people-mover — a fleet favourite from Oslo to Sydney.',
      tag_zh: '豪华纯电 MPV——从奥斯陆到悉尼的车队宠儿。',
      range: '560 km', accel: '~8 s', price: 'US$37,200', priceLocal: '¥269,900 China',
      colorA: '#0ea5e9', shape: 'mpv',
      image: 'images/maxus-mifa9.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    {
      id: 'im-ls6', brand: 'IM Motors', name: 'LS6',
      tag_en: 'Smart-luxury SUV with 800V and laser-lidar city driving.',
      tag_zh: '800V 平台 + 激光雷达城市智驾的智己主力 SUV。',
      range: '760 km', accel: '3.5 s', price: 'US$29,700', priceLocal: '¥214,900 China',
      colorA: '#7c3aed', shape: 'suv',
      image: 'images/im-ls6.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    // ---- Dongfeng family ----
    {
      id: 'voyah-free', brand: 'Voyah', name: 'Free',
      tag_en: 'Premium EREV SUV — Dongfeng\'s spearhead into Europe via Stellantis.',
      tag_zh: '高端增程 SUV——东风借道 Stellantis 进军欧洲的先锋。',
      range: '106 km EV / 860 km', accel: '4.5 s', price: 'US$30,300', priceLocal: '¥219,900 China',
      colorA: '#1d4ed8', shape: 'suv',
      image: 'images/voyah-free.jpg', imageCredit: 'User3204 / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['erev']
    },
    {
      id: 'mhero-917', brand: 'M-Hero', name: '917',
      tag_en: '1,088 hp quad-motor electric off-roader with military DNA.',
      tag_zh: '1,088 马力四电机硬派越野，军车基因。',
      range: '200 km EV / 800 km', accel: '4.2 s', price: 'US$88,000', priceLocal: '¥637,700 China',
      colorA: '#374151', shape: 'suv',
      image: 'images/mhero-917.jpg', imageCredit: 'JustAnotherCarDesigner / CC BY-SA 4.0',
      names: { cn: '猛士917', overseas: [] },
      markets: null,
      price_cn: null,
      range_note: null,
      sources: [
        { name: 'Dongfeng Motor: M-Hero 917 global debut, 19 April 2023', url: 'https://www.dfmc.com.cn/news/company/news_20230419_1141.html' }
      ],
      powertrain: ['bev', 'erev']
    },
    // ---- Chery family ----
    {
      id: 'chery-tiggo-8', brand: 'Chery', name: 'Tiggo 8 Pro',
      tag_en: 'Chery\'s 7-seat export workhorse across Russia, MENA and LatAm.',
      tag_zh: '奇瑞出口主力 7 座 SUV，横扫俄罗斯、中东与拉美。',
      range: 'ICE · PHEV', accel: '~8 s', price: '~US$17,900', priceLocal: '¥129,900 China',
      colorA: '#d4302a', shape: 'suv',
      image: 'images/chery-tiggo-8.jpg', imageCredit: 'Matti Blume / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['ice', 'phev']
    },
    {
      id: 'omoda-e5', brand: 'Omoda', name: 'E5',
      tag_en: 'Chery\'s global-first electric crossover for the UK, EU and Australia.',
      tag_zh: '奇瑞全球化战略的纯电跨界车，主攻英国、欧盟与澳洲。',
      range: '430 km (WLTP)', accel: '~7.5 s', price: 'US$42,300', priceLocal: '£33,055 UK',
      colorA: '#22c55e', shape: 'suv',
      image: 'images/omoda-e5.jpg', imageCredit: 'User3204 / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    {
      id: 'jaecoo-7', brand: 'Jaecoo', name: '7 PHEV',
      tag_en: 'Rugged-design SUV with 1,200 km combined range — a UK breakout hit.',
      tag_zh: '硬派设计 + 1,200 公里综合续航,在英国一炮而红。',
      range: '90 km EV / 1,200 km', accel: '~8.5 s', price: 'US$44,900', priceLocal: '£35,065 UK',
      colorA: '#374151', shape: 'suv',
      image: 'images/jaecoo-7.jpg', imageCredit: 'Calreyn88 / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['phev']
    },
    // ---- Leapmotor ----
    {
      id: 'leapmotor-c10', brand: 'Leapmotor', name: 'C10',
      tag_en: 'Stellantis-backed family SUV — the value benchmark in Europe.',
      tag_zh: 'Stellantis 加持的家用 SUV——欧洲市场的性价比标杆。',
      range: '530 km', accel: '~7 s', price: 'US$17,800', priceLocal: '¥128,800 China',
      colorA: '#0ea5e9', shape: 'suv',
      image: 'images/leapmotor-c10.webp', imageCredit: 'Leapmotor',
      names: { cn: null, overseas: [{ name: 'Leapmotor C10', markets: ['Germany'] }] },
      markets: ['Germany'],
      price_cn: null,
      range_note: {
        cltc: null,
        wltp: { en: 'MY27 BEV, Stellantis, 30 September 2026: 69.9 kWh Pro rear-wheel drive 430 km WLTP; 81.9 kWh ProMax rear-wheel drive 519 km WLTP. A range-extender version is also sold. Its 2024 Brussels WLTP figures were marked preliminary, so they are not listed.', zh: '2027 款纯电，Stellantis 2026-09-30：69.9 kWh Pro 后驱 WLTP 430 km；81.9 kWh ProMax 后驱 WLTP 519 km。另有增程版在售。2024 年布鲁塞尔稿把增程 WLTP 标成初步数据，这里不写。' },
        epa: null
      },
      sources: [
        { name: 'Stellantis Media: MY27 Leapmotor C10, 30 September 2026', url: 'https://www.media.stellantis.com/em-en/leapmotor/press/leapmotor-reveals-enhanced-my27-c10-with-greater-range-advanced-connectivity-and-expanded-safety-technologies' },
        { name: 'Stellantis Media Germany: C10 range-extender orders, 10 January 2025', url: 'https://www.media.stellantis.com/de-de/leapmotor/press/leapmotor-auf-dem-bruesseler-autosalon-2025-einfuehrung-des-c10-mit-range-extender' }
      ],
      powertrain: ['bev', 'erev']
    },
    {
      id: 'leapmotor-b10', brand: 'Leapmotor', name: 'B10',
      tag_en: 'The first Chinese EV built in Spain — Stellantis\'s Zaragoza plant.',
      tag_zh: '首批在西班牙本土生产的中国电动车——Stellantis 萨拉戈萨工厂出品。',
      range: '600 km', accel: '~7 s', price: 'US$13,800', priceLocal: '¥99,800 China',
      colorA: '#0ea5e9', shape: 'suv',
      image: 'images/leapmotor-b10.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: { cn: null, overseas: [{ name: 'Leapmotor B10', markets: ['Spain'] }] },
      markets: ['Spain'],
      price_cn: null,
      range_note: null,
      sources: [
        { name: 'Autonoción: Leapmotor B10 built in Spain, 22 October 2026', url: 'https://www.autonocion.com/motornocion/leapmotor-b10-fabricado-espana/' }
      ],
      powertrain: ['bev', 'erev']
    },
    // ---- Geely premium brands ----
    {
      id: 'polestar-4', brand: 'Polestar', name: '4',
      tag_en: 'The coupe-SUV that replaced the rear window with a screen.',
      tag_zh: '用屏幕取代后窗的轿跑 SUV。',
      range: '620 km', accel: '3.8 s', price: 'US$41,400', priceLocal: '¥299,900 China',
      colorA: '#111827', shape: 'suv',
      image: 'images/polestar-4.jpg', imageCredit: 'Polestar',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    {
      id: 'volvo-ex30', brand: 'Volvo', name: 'EX30',
      tag_en: 'Volvo\'s China-built compact EV — its fastest car ever, at its lowest price.',
      tag_zh: '沃尔沃在华制造的紧凑电动车——史上最快，也最亲民。',
      range: '480 km (WLTP)', accel: '3.6 s', price: 'US$40,200', priceLocal: '€36,590 EU',
      colorA: '#1d4ed8', shape: 'suv',
      image: 'images/volvo-ex30.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    {
      id: 'lotus-eletre', brand: 'Lotus', name: 'Eletre',
      tag_en: 'A 905-hp hyper-SUV from the house of Chapman, built in Wuhan.',
      tag_zh: '905 马力的超级 SUV，查普曼血统，武汉制造。',
      range: '650 km', accel: '2.95 s', price: 'US$92,200', priceLocal: '¥668,000 China',
      colorA: '#f59e0b', shape: 'suv',
      image: 'images/lotus-eletre.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['bev']
    },
    // ---- BYD premium brands ----
    {
      id: 'denza-z9gt', brand: 'Denza', name: 'Z9GT',
      tag_en: 'Tri-motor shooting brake with rear-wheel steering — Denza\'s halo.',
      tag_zh: '三电机 + 后轮转向的猎装旗舰，腾势的技术名片。',
      range: '630 km', accel: '3.4 s', price: 'US$46,200', priceLocal: '¥334,800 China',
      colorA: '#111827', shape: 'wagon',
      image: 'images/denza-z9gt.jpg', imageCredit: 'Calreyn88 / CC BY 4.0',
      names: { cn: '腾势Z9GT', overseas: [{ name: 'Denza Z9GT', markets: [] }] },
      markets: null,
      price_cn: {
        min_cny: 329800,
        max_cny: 369800,
        as_of: null,
        note_en: 'These two figures are the all-electric e3 variants in the 9 September 2026 CnEVPost report (¥329,800 and ¥369,800). Plug-in hybrid guide prices were not in the report. The report date is not shown as the official price date.',
        note_zh: '这两个数字是 2026-09-09 CnEVPost 报道里的纯电 e3 版本（32.98 万元和 36.98 万元）。报道未给出插混指导价。发稿日期不写成官方价格日期。'
      },
      range_note: {
        cltc: { en: 'All-electric e3 variants reported on 9 September 2026: new variant 860 km CLTC; Flash Charging Performance 820 km CLTC.', zh: '2026-09-09 报道的纯电 e3 版本：新版本 CLTC 860 km；闪充性能版 CLTC 820 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: 'CnEVPost: Denza Z9GT e3 variant, 9 September 2026', url: 'https://cnevpost.com/2026/09/09/denza-adds-z9gt-variant-e3-tri-motor/' }
      ],
      powertrain: ['bev']
    },
    {
      id: 'yangwang-u8', brand: 'Yangwang', name: 'U8',
      tag_en: 'The SUV that tank-turns and floats — BYD\'s ¥1M statement piece.',
      tag_zh: '能原地掉头、能浮水的 SUV——比亚迪的百万级宣言。',
      range: '180 km EV / 1,000 km', accel: '3.6 s', price: 'US$151,500', priceLocal: '¥1,098,000 China',
      colorA: '#f59e0b', shape: 'suv',
      image: 'images/yangwang-u8.jpg', imageCredit: 'User3204 / CC BY-SA 4.0',
      names: { cn: '仰望U8', overseas: [] },
      markets: null,
      price_cn: {
        min_cny: 1008000,
        max_cny: 1008000,
        as_of: null,
        note_en: 'CarNewsChina lists one 2026 Standard Edition at ¥1,008,000. Other trims were not on that page. The date on that page was not confirmed as the official price date.',
        note_zh: 'CarNewsChina 列出 2026 款标准版 100.8 万元。该页没有其他配置。页面上的日期没有核实成官方价格日期。'
      },
      range_note: {
        cltc: { en: 'Manufacturer figures listed for the 2026 model: 230 km CLTC electric and 1,205 km CLTC combined.', zh: '2026 款所载厂家口径：CLTC 纯电 230 km，CLTC 综合 1,205 km。' },
        wltp: null,
        epa: null
      },
      sources: [
        { name: 'CarNewsChina data: Yangwang U8 2026', url: 'https://db.carnewschina.com/yangwang/yangwang-u8' }
      ],
      powertrain: ['erev']
    },
    {
      id: 'fangchengbao-bao5', brand: 'Fang Cheng Bao', name: 'Bao 5',
      tag_en: 'Super-hybrid off-roader on BYD\'s DMO platform — Tank\'s new rival.',
      tag_zh: '基于比亚迪 DMO 平台的超级混动越野，坦克的新对手。',
      range: '125 km EV / 1,200 km', accel: '4.8 s', price: 'US$33,100', priceLocal: '¥239,800 China',
      colorA: '#374151', shape: 'suv',
      image: 'images/fangchengbao-5.jpg', imageCredit: 'User3204 / CC BY-SA 4.0',
      names: null, markets: null, price_cn: null, range_note: null, sources: null, powertrain: ['phev']
    }
  ],

  // Evergreen feature stories — full bodies live in js/stories-data.js (build-time only),
  // pages are generated at /stories/<slug> by build.js.
  features: [
    {
      slug: 'china-ev-battery-supply-chain',
      tag_en: 'Cover', tag_zh: '封面',
      title_en: 'How China Built the World\'s Best EV Battery Supply Chain',
      title_zh: '中国如何打造全球最强的电动车电池供应链',
      desc_en: 'CATL and BYD together produce more than half the world\'s EV batteries. The story of how that dominance was engineered, mine to module.',
      desc_zh: '宁德时代与比亚迪合计生产全球过半电动车电池。从矿山到模组，这是这场主导力如何被构建的故事。',
      meta_en: 'TECHNOLOGY · 8 MIN', meta_zh: '技术 · 8 分钟',
      shape: 'sedan', accent: '#d4302a', large: true,
      image: 'images/byd-seal.jpg', imageCredit: 'BYD'
    },
    {
      slug: 'nio-battery-swap-bet',
      tag_en: 'Brand', tag_zh: '品牌',
      title_en: 'NIO\'s Battery Swap Bet',
      title_zh: '蔚来的换电豪赌',
      desc_en: 'Three minutes, full charge. Why NIO built 3,000 stations — and why CATL and Geely joined in.',
      desc_zh: '三分钟满电。解析蔚来为何投入建设 3,000 座换电站，以及宁德时代、吉利等玩家为何也开始加入换电生态。',
      meta_en: 'PROFILE · 6 MIN', meta_zh: '品牌 · 6 分钟',
      shape: 'sedan-long', accent: '#1d4ed8',
      image: 'images/nio-et9.jpg', imageCredit: 'S5A-0043 / CC BY 4.0'
    },
    {
      slug: 'xiaomi-su7-design',
      tag_en: 'Design', tag_zh: '设计',
      title_en: 'Why Xiaomi\'s SU7 Looks Familiar',
      title_zh: '为什么小米 SU7 看起来眼熟',
      desc_en: 'Inside the design language borrowing from Porsche — and where it diverges.',
      desc_zh: '解析小米 SU7 为何看起来像保时捷：它借鉴了哪些跑车比例，又在哪些智能化与产品定位上形成自己的差异。',
      meta_en: 'DESIGN · 5 MIN', meta_zh: '设计 · 5 分钟',
      shape: 'sedan', accent: '#f97316',
      image: 'images/xiaomi-su7-ultra.jpg', imageCredit: 'Daniel Lu (User:dllu) / CC BY-SA 4.0'
    }
  ],

  news: [
    {
      title_en: 'Chinese EVs Cross 4 Million Annual Exports in 2025',
      title_zh: '2025 年中国电动车出口突破 400 万辆大关',
      excerpt_en: 'China surpassed Japan as the world\'s largest auto exporter for the third consecutive year, with NEV exports growing 38%.',
      excerpt_zh: '中国连续三年超越日本成为全球第一大汽车出口国，新能源车出口同比增长 38%。',
      date: 'May 22, 2026', tag_en: 'Industry', tag_zh: '产业', accent: '#d4302a',
      image: 'images/byd-seal.jpg', imageCredit: 'BYD'
    },
    {
      title_en: 'BYD Opens First European Plant in Hungary',
      title_zh: '比亚迪首座欧洲工厂在匈牙利投产',
      excerpt_en: 'The Szeged facility starts production of the Dolphin and Atto 3 for the European market, bypassing tariffs.',
      excerpt_zh: '塞格德工厂开始为欧洲市场生产海豚与元 Plus，绕开关税壁垒。',
      date: 'May 18, 2026', tag_en: 'Export', tag_zh: '出海', accent: '#1d4ed8',
      image: 'images/byd-brand.jpg', imageCredit: 'Alexander-93 / CC BY-SA 4.0'
    },
    {
      title_en: 'Xpeng MONA M03 Crosses 200K Deliveries in 12 Months',
      title_zh: '小鹏 MONA M03 上市 12 个月交付突破 20 万',
      excerpt_en: 'The sub-$20K smart EV reshaped the entry-level market and proved L2++ autonomy can be democratised.',
      excerpt_zh: '这台不到 13 万元的智能车重塑了入门级市场，证明 L2++ 智驾可以普及。',
      date: 'May 10, 2026', tag_en: 'Launch', tag_zh: '新车', accent: '#22c55e',
      image: 'images/xpeng-brand.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      title_en: 'Solid-State Batteries: CATL and BYD Both Target 2027',
      title_zh: '固态电池：宁德时代与比亚迪同步瞄准 2027',
      excerpt_en: 'Pilot lines are running. Energy density above 400 Wh/kg. The question is no longer "if" but "at what cost".',
      excerpt_zh: '中试线已运行，能量密度突破 400 Wh/kg。问题不再是「能否」，而是「成本」。',
      date: 'May 04, 2026', tag_en: 'Tech', tag_zh: '技术', accent: '#f59e0b',
      image: 'images/yangwang-u8.jpg', imageCredit: 'User3204 / CC BY-SA 4.0'
    },
    {
      title_en: 'NIO Power Swap Network Hits 3,000 Stations Globally',
      title_zh: '蔚来换电网络全球突破 3,000 座',
      excerpt_en: 'Including 60 stations in Europe. CATL, Geely, and Changan have joined the open swap standard.',
      excerpt_zh: '其中欧洲 60 座。宁德时代、吉利、长安已加入开放换电联盟。',
      date: 'April 28, 2026', tag_en: 'Infrastructure', tag_zh: '基建', accent: '#0ea5e9',
      image: 'images/nio-brand.jpg', imageCredit: 'Alexander Migl / CC BY-SA 4.0'
    }
  ],

  tech: [
    {
      num: '01', title_en: '800V High-Voltage Architecture', title_zh: '800V 高压平台',
      desc_en: 'China leapfrogged the industry. By 2026, more than 40 Chinese EV models ship with 800V systems enabling 10-minute fast charging. Xpeng, Zeekr, BYD, Li Auto all standardised.',
      desc_zh: '中国已实现弯道超车。到 2026 年，超过 40 款中国电动车型搭载 800V 系统，10 分钟快充成为常态。小鹏、极氪、比亚迪、理想均已普及。',
      tags: ['Silicon Carbide', '5C Charging', '10-Min Refill']
    },
    {
      num: '02', title_en: 'City-Level Autonomous Driving', title_zh: '城市领航辅助驾驶',
      desc_en: 'Xpeng XNGP, Huawei ADS 3.0, NIO NAD — point-to-point urban autonomy without HD maps. The technology that surprised Tesla.',
      desc_zh: '小鹏 XNGP、华为 ADS 3.0、蔚来 NAD——无图城市点到点智驾，让特斯拉感到压力的技术。',
      tags: ['No HD Map', 'BEV+Transformer', 'End-to-End']
    },
    {
      num: '03', title_en: 'Smart Cockpit Revolution', title_zh: '智能座舱革命',
      desc_en: 'Huawei HarmonyOS Cockpit, Xiaomi HyperOS, Li Auto OS — multi-screen, voice-first, app-rich interiors that make legacy infotainment feel a decade behind.',
      desc_zh: '华为鸿蒙座舱、小米澎湃 OS、理想 OS——多屏、语音优先、生态丰富，让传统车机系统瞬间显得落后十年。',
      tags: ['HarmonyOS', 'AI Assistant', 'Multi-Screen']
    },
    {
      num: '04', title_en: 'Blade & Cell-to-Body Batteries', title_zh: '刀片与 CTB 电池',
      desc_en: 'BYD\'s LFP Blade battery and CATL\'s cell-to-body designs deliver safety and density at lower cost. The reason Chinese EVs hit price parity with ICE first.',
      desc_zh: '比亚迪刀片磷酸铁锂电池与宁德时代 CTB 设计——以更低成本实现安全与能量密度，是中国电动车率先与燃油车同价的关键。',
      tags: ['LFP', 'CTB', 'Thermal Safety']
    }
  ]
};
