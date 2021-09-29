export default function tipModel(sequelize, DataTypes) {
  return sequelize.define('tip', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    tip: {
      type: DataTypes.TEXT,
    },
    gameState: {
      type: DataTypes.JSON,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,

    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,

    },
  }, { underscored: true });
}
