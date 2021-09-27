export default function gameTurnModel(sequelize, DataTypes) {
  return sequelize.define('gameTurn', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'game',
        key: 'id',
      },
    },
    turnNum: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    blackMove: {
      type: DataTypes.CHAR(2),
    },
    whiteMove: {
      type: DataTypes.CHAR(2),
    },
    gameState: {
      type: DataTypes.JSON,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, { underscored: true });
}
