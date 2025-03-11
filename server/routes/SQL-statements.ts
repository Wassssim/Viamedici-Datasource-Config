export const getDataAboutHierarchyId = {
  query: {
    match: {
      hierarchyId: '',
    },
  },
  sort: [],
};

export const getDataAboutPratId = {
  query: {
    match: {
      pratId: '',
    },
  },
};

export const getDataAboutUnitgroupname = {
  query: {
    match: {
      UNITGROUP_NAME: '',
    },
  },
};

export const getDataAboutSigngroupname = {
  query: {
    match: {
      SIGNGROUP_NAME: '',
    },
  },
};

export const getProductAndSystemhierarchies = {
  query: {
    bool: {
      should: [
        {
          wildcard: {
            hierarchyShortcut: { value: '', case_insensitive: true },
          },
        },
        {
          wildcard: {
            hierarchyNameDeuDeu: { value: '', case_insensitive: true },
          },
        },
        {
          wildcard: {
            hierarchyNameEngGlo: { value: '', case_insensitive: true },
          },
        },
      ],
      must: [],
      minimum_should_match: 1,
    },
  },
  size: 10000,
  sort: [{ hierarchyShortcut: { order: 'asc' } }],
};
