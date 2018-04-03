import Tag from './tag';

export default {
  // 'Extend' Tag
  ...Tag,

  properties: {
    ...Tag.properties,

    "startPosition": {
      type: "integer",
    },
    "confidence": {
      type: "double",
    },
    "detectedAs": {
      type: "text",
    },
  }
}
