class CreatePlayers < ActiveRecord::Migration
  def change
    create_table :players do |t|
      t.string :player_name
      t.string :score
      t.references :game, index: true

      t.timestamps null: false
    end
    add_foreign_key :players, :games
  end
end
