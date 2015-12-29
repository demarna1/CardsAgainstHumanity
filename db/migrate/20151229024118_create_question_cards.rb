class CreateQuestionCards < ActiveRecord::Migration
  def change
    create_table :question_cards do |t|
      t.string :text

      t.timestamps null: false
    end
  end
end
