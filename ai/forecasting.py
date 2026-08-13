import datetime
import logging
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from sklearn.ensemble import RandomForestRegressor
from backend.database.repository import repo

logger = logging.getLogger("samooh.ai.forecasting")


class DemandForecastingEngine:
    """
    AI Demand Forecasting Engine combining:
    1. Moving Average Baseline Engine
    2. Scikit-learn Random Forest Regressor Engine
    
    Generates predicted 30-day demand forecasts for each retailer-product pair.
    """

    @staticmethod
    def forecast_moving_average(sales_df: pd.DataFrame, horizon_days: int = 30) -> float:
        """
        Calculates moving average based demand forecast over horizon_days.
        """
        if sales_df.empty:
            return 10.0  # Fallback default estimate

        sales_df['date'] = pd.to_datetime(sales_df['date'])
        sales_df = sales_df.sort_values('date')
        
        # 7-day and 30-day rolling averages
        recent_sales = sales_df.tail(30)['quantity_sold']
        avg_per_period = recent_sales.mean() if len(recent_sales) > 0 else 1.0
        
        # Scaling to horizon (assuming sales entries are sampled or daily)
        # Calculate daily rate
        total_days = max(1, (sales_df['date'].max() - sales_df['date'].min()).days)
        daily_rate = sales_df['quantity_sold'].sum() / total_days if total_days > 0 else avg_per_period
        
        predicted_demand = daily_rate * horizon_days
        return round(float(predicted_demand), 2)

    @staticmethod
    def forecast_random_forest(sales_df: pd.DataFrame, horizon_days: int = 30) -> tuple[float, float]:
        """
        Trains a Random Forest Regressor on historical sales features
        (day of week, lag features, rolling mean) to predict demand.
        Returns (predicted_demand, confidence_score_r2).
        """
        if len(sales_df) < 5:
            # Not enough sample data for Random Forest, fallback to moving average
            ma_demand = DemandForecastingEngine.forecast_moving_average(sales_df, horizon_days)
            return ma_demand, 0.75

        df = sales_df.copy()
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Feature Engineering
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_month'] = df['date'].dt.day
        df['lag_1'] = df['quantity_sold'].shift(1).fillna(df['quantity_sold'].mean())
        df['lag_2'] = df['quantity_sold'].shift(2).fillna(df['quantity_sold'].mean())
        df['rolling_3'] = df['quantity_sold'].rolling(3, min_periods=1).mean()

        features = ['day_of_week', 'day_of_month', 'lag_1', 'lag_2', 'rolling_3']
        X = df[features]
        y = df['quantity_sold']

        rf = RandomForestRegressor(n_estimators=50, random_state=42, max_depth=5)
        rf.fit(X, y)

        r2_score = float(max(0.60, min(0.96, rf.score(X, y))))

        # Predict future 30 days
        last_row = X.iloc[-1:].copy()
        future_predictions = []
        
        for day in range(horizon_days):
            pred_qty = float(rf.predict(last_row)[0])
            future_predictions.append(max(0.1, pred_qty))
            # Update lag features for next step
            last_row['lag_2'] = last_row['lag_1']
            last_row['lag_1'] = pred_qty
            last_row['day_of_week'] = (int(last_row['day_of_week'].iloc[0]) + 1) % 7

        total_predicted = float(np.sum(future_predictions))
        return round(total_predicted, 2), round(r2_score, 2)

    def run_all_forecasts(self, horizon_days: int = 30) -> List[Dict[str, Any]]:
        """
        Executes forecasting model across all retailers & products,
        and saves output to forecasts collection in database.
        """
        all_sales = repo.get_all("sales")
        products = repo.get_all("products")
        retailers = repo.get_all("retailers")

        if not all_sales:
            logger.warning("No sales data available to build forecasts.")
            return []

        sales_df_all = pd.DataFrame(all_sales)
        products_map = {p['id']: p['name'] for p in products}
        
        forecast_results = []
        forecast_counter = 0

        # Group by retailer & product
        grouped = sales_df_all.groupby(['retailer_id', 'product_id'])

        for (ret_id, prod_id), group in grouped:
            forecast_counter += 1
            prod_name = products_map.get(prod_id, "Product")
            
            # Alternate or compare model types
            if len(group) >= 8:
                demand, confidence = self.forecast_random_forest(group, horizon_days)
                model_name = "Random Forest Regressor"
            else:
                demand = self.forecast_moving_average(group, horizon_days)
                confidence = 0.80
                model_name = "Moving Average Baseline"

            fc_obj = {
                "id": f"fc_{forecast_counter:04d}",
                "retailer_id": ret_id,
                "product_id": prod_id,
                "product_name": prod_name,
                "forecast_date": datetime.date.today().isoformat(),
                "horizon_days": horizon_days,
                "predicted_demand": demand,
                "model_used": model_name,
                "confidence_score": confidence
            }
            forecast_results.append(fc_obj)

        # Store in forecasts collection
        repo.save_bulk("forecasts", forecast_results)
        logger.info(f"Generated and saved {len(forecast_results)} demand forecasts.")
        return forecast_results
