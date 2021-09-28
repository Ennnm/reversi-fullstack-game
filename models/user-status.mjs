export default function userStatusModel(sequelize, DataTypes) {
  return sequelize.define('user_status', {
    userId: {
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
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, { underscored: true });
}
