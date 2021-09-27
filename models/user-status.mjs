export default function userStatusModel(sequelize, DataTypes) {
  return sequelize.define('status', {
    id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    inGame: {
      type: DataTypes.BOOLEAN,
    },
    lastAction: {
      type: DataTypes.DATE,
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
